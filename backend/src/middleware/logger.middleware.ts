import morgan from "morgan";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const loggerMiddleware = morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});
