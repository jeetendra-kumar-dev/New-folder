import { z } from "zod";

const categorySchema = z.enum([
  "ENTERTAINMENT",
  "PRODUCTIVITY",
  "EDUCATION",
  "FINANCE",
  "HEALTH",
  "LIFESTYLE",
  "UTILITIES",
  "OTHER",
]);

export const createSubscriptionBodySchema = z
  .object({
    serviceName: z.string().trim().min(1).max(120),
    renewalDate: z.string().trim().datetime(),
    amount: z.coerce.number().positive(),
    category: categorySchema.default("OTHER"),
    autoRenew: z.boolean().default(true),
    reminderDays: z.array(z.coerce.number().int().min(0).max(365)).min(1).default([7]),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const updateSubscriptionBodySchema = createSubscriptionBodySchema.partial().strict();

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionBodySchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionBodySchema>;
