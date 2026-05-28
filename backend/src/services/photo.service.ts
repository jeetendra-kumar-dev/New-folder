import { prisma } from "../lib/prisma";
import type { CreatePhotoInput, UpdatePhotoInput } from "../types/workspace";
import { AppError } from "../utils/app-error";
import { assertSectionOwnership, assertTypeOwnership } from "./section.service";

const photoSelect = {
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

export async function listPhotos(userId: string) {
  return prisma.photo.findMany({ where: { userId }, select: photoSelect, orderBy: { updatedAt: "desc" } });
}

export async function createPhoto(userId: string, input: CreatePhotoInput) {
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.photo.create({ data: { userId, ...input, tags: input.tags ?? [] }, select: photoSelect });
}

export async function updatePhoto(userId: string, id: string, input: UpdatePhotoInput) {
  const existing = await prisma.photo.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Photo not found", 404, "PHOTO_NOT_FOUND");
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.photo.update({ where: { id }, data: input, select: photoSelect });
}

export async function deletePhoto(userId: string, id: string) {
  const existing = await prisma.photo.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Photo not found", 404, "PHOTO_NOT_FOUND");
  await prisma.photo.delete({ where: { id } });
  return { deleted: true };
}
