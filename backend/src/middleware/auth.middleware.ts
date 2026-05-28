import type { RequestHandler } from "express";
import type { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError("Authentication token is required", 401, "AUTH_TOKEN_REQUIRED");
  }

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("Authenticated user no longer exists", 401, "USER_NOT_FOUND");
  }

  req.user = user;
  next();
});

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Authentication is required", 401, "AUTH_REQUIRED");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to access this resource", 403, "FORBIDDEN");
    }

    next();
  };
}
