import { prisma } from "../lib/prisma";
import type { CreateContentTypeInput, UpdateContentTypeInput } from "../types/workspace";
import { AppError } from "../utils/app-error";

const typeSelect = {
  id: true,
  name: true,
  color: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listContentTypes(userId: string) {
  return prisma.contentType.findMany({
    where: { userId },
    select: typeSelect,
    orderBy: { name: "asc" },
  });
}

export async function createContentType(userId: string, input: CreateContentTypeInput) {
  return prisma.contentType.create({
    data: { userId, ...input },
    select: typeSelect,
  });
}

export async function updateContentType(userId: string, id: string, input: UpdateContentTypeInput) {
  const existing = await prisma.contentType.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Content type not found", 404, "CONTENT_TYPE_NOT_FOUND");
  return prisma.contentType.update({ where: { id }, data: input, select: typeSelect });
}

export async function deleteContentType(userId: string, id: string) {
  const existing = await prisma.contentType.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Content type not found", 404, "CONTENT_TYPE_NOT_FOUND");
  await prisma.contentType.delete({ where: { id } });
  return { deleted: true };
}
