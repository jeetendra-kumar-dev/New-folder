import { z } from "zod";

export const notificationQuerySchema = z
  .object({
    unreadOnly: z
      .string()
      .optional()
      .transform((value) => value === "true"),
  })
  .strict();

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
