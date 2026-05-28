import type { CorsOptions } from "cors";
import { env } from "./env";

const allowedOrigins = env.CORS_ORIGIN
  .split(",")
  .map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  origin(origin, callback) {
    // allow requests without origin
    if (!origin) {
      return callback(null, true);
    }

    // allow matching origins
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    // block others
    return callback(null, false);
  },
};