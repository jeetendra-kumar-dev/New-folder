import { createServer } from "node:http";
import { app } from "./app";
import { env } from "./config/env";
import { startJobs, stopJobs } from "./jobs";
import { prisma } from "./lib/prisma";
import { logger } from "./utils/logger";

const server = createServer(app);

async function bootstrap() {
  await prisma.$connect();
  startJobs();

  server.listen(env.PORT, () => {
    logger.info(`API server listening on port ${env.PORT}`, {
      environment: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
    });
  });
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    stopJobs();
    await prisma.$disconnect();
    logger.info("Server shutdown complete");
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

bootstrap().catch(async (error) => {
  logger.error("Failed to start API server", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });

  await prisma.$disconnect();
  process.exit(1);
});
