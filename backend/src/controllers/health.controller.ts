import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export const healthCheck = asyncHandler(async (_req, res) => {
  return sendSuccess(res, {
    status: "ok",
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export const readinessCheck = asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;

  return sendSuccess(res, {
    status: "ready",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});
