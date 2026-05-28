import { prisma } from "../lib/prisma";
import type { CreateGraphicInput, UpdateGraphicInput } from "../types/workspace";
import { AppError } from "../utils/app-error";
import { assertSectionOwnership, assertTypeOwnership } from "./section.service";

const graphicSelect = {
  id: true,
  title: true,
  url: true,
  kind: true,
  description: true,
  tags: true,
  sectionId: true,
  typeId: true,
  section: { select: { id: true, name: true, color: true } },
  type: { select: { id: true, name: true, color: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export async function listGraphics(userId: string) {
  return prisma.graphic.findMany({ where: { userId }, select: graphicSelect, orderBy: { updatedAt: "desc" } });
}

export async function createGraphic(userId: string, input: CreateGraphicInput) {
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.graphic.create({ data: { userId, ...input, tags: input.tags ?? [] }, select: graphicSelect });
}

export async function updateGraphic(userId: string, id: string, input: UpdateGraphicInput) {
  const existing = await prisma.graphic.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Graphic not found", 404, "GRAPHIC_NOT_FOUND");
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.graphic.update({ where: { id }, data: input, select: graphicSelect });
}

export async function deleteGraphic(userId: string, id: string) {
  const existing = await prisma.graphic.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Graphic not found", 404, "GRAPHIC_NOT_FOUND");
  await prisma.graphic.delete({ where: { id } });
  return { deleted: true };
}
