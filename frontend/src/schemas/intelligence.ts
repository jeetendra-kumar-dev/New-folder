import { z } from "zod";

export const intelligenceHorizonSchema = z.enum(["today", "week", "month"]);
export const intelligenceFocusSchema = z.enum(["all", "money", "goals", "learning", "operations"]);

export const intelligencePromptSchema = z
  .object({
    prompt: z.string().trim().min(12, "Add a little more context before running AI.").max(2000, "Keep the prompt under 2,000 characters."),
    sourceInsightId: z.string().optional(),
  })
  .strict();

export type IntelligenceHorizon = z.infer<typeof intelligenceHorizonSchema>;
export type IntelligenceFocus = z.infer<typeof intelligenceFocusSchema>;
export type IntelligencePromptInput = z.infer<typeof intelligencePromptSchema>;
