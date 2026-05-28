import { z } from "zod";
import type { UserRole } from "@prisma/client";

export type AccessTokenPayload = {
  userId: string;
  role: UserRole;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  tokenId: string;
};

export const signupBodySchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().toLowerCase(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[0-9]/, "Password must include a number"),
  })
  .strict();

export const registerBodySchema = signupBodySchema;

export const loginBodySchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1),
  })
  .strict();

export const refreshTokenBodySchema = z
  .object({
    refreshToken: z.string().trim().min(1),
  })
  .strict();

export const requestOtpBodySchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
  })
  .strict();

export const verifyOtpBodySchema = z
  .object({
    email: z.string().trim().email().toLowerCase(),
    code: z.string().trim().regex(/^\d{6}$/, "OTP code must be 6 digits"),
    name: z.string().trim().min(2).max(80).optional(),
  })
  .strict();

export type SignupInput = z.infer<typeof signupBodySchema>;
export type RegisterInput = SignupInput;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RequestOtpInput = z.infer<typeof requestOtpBodySchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpBodySchema>;
