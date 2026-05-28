import cron from "node-cron";
import { logger } from "../utils/logger";

export function createReminderJob() {
  return cron.createTask(
    "*/15 * * * *",
    () => {
      logger.info("Reminder job placeholder executed");
    },
    {
      timezone: "UTC",
    },
  );
}
