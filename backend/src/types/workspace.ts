import { z } from "zod";

const optionalId = z.string().cuid().optional();

export const createSectionBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional(),
    color: z.string().trim().max(32).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const updateSectionBodySchema = createSectionBodySchema.partial().strict();

export const createContentTypeBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    color: z.string().trim().max(32).optional(),
  })
  .strict();

export const updateContentTypeBodySchema = createContentTypeBodySchema.partial().strict();

const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(160),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.coerce.date().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const createRoadmapBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
    sectionId: optionalId,
    typeId: optionalId,
    milestones: z.array(milestoneSchema).max(50).optional(),
  })
  .strict();

export const updateRoadmapBodySchema = createRoadmapBodySchema
  .omit({ milestones: true })
  .partial()
  .extend({ milestones: z.array(milestoneSchema.extend({ id: z.string().cuid().optional() })).max(50).optional() })
  .strict();

export const createNoteBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(50000),
    sectionId: optionalId,
    typeId: optionalId,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .strict();

export const updateNoteBodySchema = createNoteBodySchema.partial().strict();

export const createPhotoBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    url: z.string().trim().url().max(2048),
    caption: z.string().trim().max(2000).optional(),
    sectionId: optionalId,
    typeId: optionalId,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .strict();

export const updatePhotoBodySchema = createPhotoBodySchema.partial().strict();

export const createVideoBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    url: z.string().trim().url().max(2048),
    caption: z.string().trim().max(2000).optional(),
    sectionId: optionalId,
    typeId: optionalId,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .strict();

export const updateVideoBodySchema = createVideoBodySchema.partial().strict();

export const createGraphicBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    url: z.string().trim().url().max(2048),
    kind: z.enum(["DIAGRAM", "CHART", "MOCKUP", "ICON", "ILLUSTRATION", "OTHER"]).optional(),
    description: z.string().trim().max(4000).optional(),
    sectionId: optionalId,
    typeId: optionalId,
    tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  })
  .strict();

export const updateGraphicBodySchema = createGraphicBodySchema.partial().strict();

export type CreateSectionInput = z.infer<typeof createSectionBodySchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionBodySchema>;
export type CreateContentTypeInput = z.infer<typeof createContentTypeBodySchema>;
export type UpdateContentTypeInput = z.infer<typeof updateContentTypeBodySchema>;
export type CreateRoadmapInput = z.infer<typeof createRoadmapBodySchema>;
export type UpdateRoadmapInput = z.infer<typeof updateRoadmapBodySchema>;
export type CreateNoteInput = z.infer<typeof createNoteBodySchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteBodySchema>;
export type CreatePhotoInput = z.infer<typeof createPhotoBodySchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoBodySchema>;
export type CreateVideoInput = z.infer<typeof createVideoBodySchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoBodySchema>;
export type CreateGraphicInput = z.infer<typeof createGraphicBodySchema>;
export type UpdateGraphicInput = z.infer<typeof updateGraphicBodySchema>;
