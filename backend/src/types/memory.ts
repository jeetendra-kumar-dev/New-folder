import { z } from "zod";

const memoryTypeSchema = z.enum(["PREFERENCE", "FACT", "CONTEXT", "INSIGHT", "REMINDER", "OTHER"]);

export const createMemoryBodySchema = z
  .object({
    type: memoryTypeSchema.default("CONTEXT"),
    title: z.string().trim().min(1).max(160).optional(),
    content: z.string().trim().min(1).max(8000),
    importance: z.coerce.number().int().min(1).max(5).default(1),
    source: z.string().trim().max(120).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateMemoryBodySchema = createMemoryBodySchema.partial().strict();

export type CreateMemoryInput = z.infer<typeof createMemoryBodySchema>;
export type UpdateMemoryInput = z.infer<typeof updateMemoryBodySchema>;
