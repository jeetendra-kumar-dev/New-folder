import { z } from "zod";

export const chatBodySchema = z
  .object({
    message: z.string().trim().min(1).max(8000),
    conversationId: z.string().cuid().optional(),
  })
  .strict();

export type ChatInput = z.infer<typeof chatBodySchema>;

export const aiModelIdSchema = z.enum([
  "portfolio-mentor",
  "subscription-optimizer",
  "goal-coach",
  "content-classifier",
  "model-architect",
]);

export const runAiModelBodySchema = z
  .object({
    modelId: aiModelIdSchema,
    input: z.string().trim().min(1).max(4000),
    temperature: z.coerce.number().min(0).max(1).default(0.3),
  })
  .strict();

export type AiModelId = z.infer<typeof aiModelIdSchema>;
export type RunAiModelInput = z.infer<typeof runAiModelBodySchema>;
