import { prisma } from "../lib/prisma";
import type { CreateSectionInput, UpdateSectionInput } from "../types/workspace";
import { AppError } from "../utils/app-error";

const sectionSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listSections(userId: string) {
  return prisma.section.findMany({
    where: { userId },
    select: sectionSelect,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createSection(userId: string, input: CreateSectionInput) {
  return prisma.section.create({
    data: { userId, ...input },
    select: sectionSelect,
  });
}

export async function updateSection(userId: string, id: string, input: UpdateSectionInput) {
  const existing = await prisma.section.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Section not found", 404, "SECTION_NOT_FOUND");
  return prisma.section.update({ where: { id }, data: input, select: sectionSelect });
}

export async function deleteSection(userId: string, id: string) {
  const existing = await prisma.section.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Section not found", 404, "SECTION_NOT_FOUND");
  await prisma.section.delete({ where: { id } });
  return { deleted: true };
}

export async function assertSectionOwnership(userId: string, sectionId?: string | null) {
  if (!sectionId) return;
  const section = await prisma.section.findFirst({ where: { id: sectionId, userId }, select: { id: true } });
  if (!section) throw new AppError("Section not found", 404, "SECTION_NOT_FOUND");
}

export async function assertTypeOwnership(userId: string, typeId?: string | null) {
  if (!typeId) return;
  const type = await prisma.contentType.findFirst({ where: { id: typeId, userId }, select: { id: true } });
  if (!type) throw new AppError("Content type not found", 404, "CONTENT_TYPE_NOT_FOUND");
}
