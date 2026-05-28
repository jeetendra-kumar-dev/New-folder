import { prisma } from "../lib/prisma";
import type { CreateVideoInput, UpdateVideoInput } from "../types/workspace";
import { AppError } from "../utils/app-error";
import { assertSectionOwnership, assertTypeOwnership } from "./section.service";

const videoSelect = {
  id: true,
  title: true,
  url: true,
  caption: true,
  tags: true,
  sectionId: true,
  typeId: true,
  section: { select: { id: true, name: true, color: true } },
  type: { select: { id: true, name: true, color: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export async function listVideos(userId: string) {
  return prisma.video.findMany({ where: { userId }, select: videoSelect, orderBy: { updatedAt: "desc" } });
}

export async function createVideo(userId: string, input: CreateVideoInput) {
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.video.create({ data: { userId, ...input, tags: input.tags ?? [] }, select: videoSelect });
}

export async function updateVideo(userId: string, id: string, input: UpdateVideoInput) {
  const existing = await prisma.video.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Video not found", 404, "VIDEO_NOT_FOUND");
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.video.update({ where: { id }, data: input, select: videoSelect });
}

export async function deleteVideo(userId: string, id: string) {
  const existing = await prisma.video.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Video not found", 404, "VIDEO_NOT_FOUND");
  await prisma.video.delete({ where: { id } });
  return { deleted: true };
}
