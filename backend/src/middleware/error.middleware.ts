import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env";
import { sendError } from "../utils/api-response";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return sendError(res, "Validation failed", 422, "VALIDATION_ERROR", error.flatten());
  }

  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode, error.code, error.details);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return sendError(res, "A record with this value already exists", 409, "UNIQUE_CONSTRAINT", error.meta);
    }
  }

  logger.error("Unhandled application error", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });

  return sendError(
    res,
    "Internal server error",
    500,
    "INTERNAL_SERVER_ERROR",
    env.NODE_ENV === "development" && error instanceof Error ? { message: error.message, stack: error.stack } : undefined,
  );
};
