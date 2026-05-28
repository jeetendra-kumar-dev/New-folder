import { z } from "zod";

const goalStatusSchema = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]);

const goalBodyBaseSchema = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    totalDays: z.coerce.number().int().min(1).max(3650),
    completedDays: z.coerce.number().int().min(0).default(0),
    status: goalStatusSchema.default("IN_PROGRESS"),
    startedAt: z.string().trim().datetime().optional(),
    targetDate: z.string().trim().datetime().optional(),
  });

export const createGoalBodySchema = goalBodyBaseSchema
  .refine((value) => value.completedDays <= value.totalDays, {
    message: "completedDays cannot be greater than totalDays",
    path: ["completedDays"],
  })
  .strict();

export const updateGoalBodySchema = goalBodyBaseSchema.partial().strict();

export type CreateGoalInput = z.infer<typeof createGoalBodySchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalBodySchema>;
