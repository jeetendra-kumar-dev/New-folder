import type { Response } from "express";

type ApiMeta = Record<string, unknown>;

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: ApiMeta,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = "INTERNAL_SERVER_ERROR",
  details?: unknown,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(details ? { details } : {}),
    },
  });
}
