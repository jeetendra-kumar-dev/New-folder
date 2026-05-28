import type { ScheduledTask } from "node-cron";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { createReminderJob } from "./reminder.job";

const jobs: ScheduledTask[] = [];

export function startJobs() {
  const reminderJob = createReminderJob();
  jobs.push(reminderJob);

  if (env.NODE_ENV !== "test") {
    reminderJob.start();
    logger.info("Background jobs started");
  }
}

export function stopJobs() {
  for (const job of jobs) {
    job.stop();
  }

  logger.info("Background jobs stopped");
}
