import jwt, { type SignOptions } from "jsonwebtoken";
import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth";
import { env } from "../config/env";
import { AppError } from "./app-error";

function signToken(payload: object, secret: string, expiresIn: string) {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export function signAccessToken(payload: AccessTokenPayload) {
  return signToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw new AppError("Invalid or expired access token", 401, "INVALID_ACCESS_TOKEN");
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
}
