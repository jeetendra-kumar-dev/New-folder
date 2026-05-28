import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { LoginInput, RequestOtpInput, SignupInput, VerifyOtpInput } from "../types/auth";
import { AppError } from "../utils/app-error";
import { durationToMs } from "../utils/time";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { env } from "../config/env";
import { sendLoginOtp } from "./email.service";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

async function createTokenPair(user: Pick<PublicUser, "id" | "role">) {
  const tokenId = randomUUID();
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role, tokenId });
  const tokenHash = await hashPassword(refreshToken);
  const expiresAt = new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshSession.create({
    data: {
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
}

export async function signup(input: SignupInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("An account already exists for this email", 409, "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: publicUserSelect,
  });

  const tokens = await createTokenPair(user);

  return { user, tokens };
}

export const register = signup;

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const passwordIsValid = await verifyPassword(input.password, user.passwordHash);

  if (!passwordIsValid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  const tokens = await createTokenPair(publicUser);

  return { user: publicUser, tokens };
}

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestEmailOtp(input: RequestOtpInput) {
  const code = generateOtpCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.emailOtp.updateMany({
    where: {
      email: input.email,
      purpose: "LOGIN",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      consumedAt: new Date(),
    },
  });

  await prisma.emailOtp.create({
    data: {
      email: input.email,
      codeHash,
      purpose: "LOGIN",
      expiresAt,
    },
  });

  const delivery = await sendLoginOtp(input.email, code);

  return {
    email: input.email,
    expiresAt,
    delivery,
    ...(env.NODE_ENV === "development" && delivery.channel === "console" ? { debugCode: code } : {}),
  };
}

export async function verifyEmailOtp(input: VerifyOtpInput) {
  const otp = await prisma.emailOtp.findFirst({
    where: {
      email: input.email,
      purpose: "LOGIN",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError("OTP code is invalid or expired", 401, "OTP_INVALID");
  }

  if (otp.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError("OTP attempt limit reached. Request a new code.", 429, "OTP_ATTEMPTS_EXCEEDED");
  }

  const codeMatches = await verifyPassword(input.code, otp.codeHash);

  if (!codeMatches) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    throw new AppError("OTP code is invalid or expired", 401, "OTP_INVALID");
  }

  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      emailVerified: new Date(),
    },
    create: {
      email: input.email,
      name: input.name,
      emailVerified: new Date(),
    },
    select: publicUserSelect,
  });

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  const tokens = await createTokenPair(user);

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      message: "You signed in with email OTP.",
      metadata: { channel: "email" },
    },
  });

  return { user, tokens };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const session = await prisma.refreshSession.findUnique({
    where: { id: payload.tokenId },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new AppError("Refresh session is no longer valid", 401, "REFRESH_SESSION_INVALID");
  }

  const tokenMatches = await verifyPassword(refreshToken, session.tokenHash);

  if (!tokenMatches) {
    throw new AppError("Refresh token does not match this session", 401, "REFRESH_TOKEN_MISMATCH");
  }

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await createTokenPair(session.user);

  return { user: session.user, tokens };
}

export async function logout(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  await prisma.refreshSession.updateMany({
    where: {
      id: payload.tokenId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return { revoked: true };
}
