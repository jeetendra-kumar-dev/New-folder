import { prisma } from "../lib/prisma";
import type { CreateNoteInput, UpdateNoteInput } from "../types/workspace";
import { AppError } from "../utils/app-error";
import { assertSectionOwnership, assertTypeOwnership } from "./section.service";

const noteSelect = {
  id: true,
  title: true,
  content: true,
  tags: true,
  sectionId: true,
  typeId: true,
  section: { select: { id: true, name: true, color: true } },
  type: { select: { id: true, name: true, color: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export async function listNotes(userId: string) {
  return prisma.note.findMany({ where: { userId }, select: noteSelect, orderBy: { updatedAt: "desc" } });
}

export async function createNote(userId: string, input: CreateNoteInput) {
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.note.create({ data: { userId, ...input, tags: input.tags ?? [] }, select: noteSelect });
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput) {
  const existing = await prisma.note.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  return prisma.note.update({ where: { id }, data: input, select: noteSelect });
}

export async function deleteNote(userId: string, id: string) {
  const existing = await prisma.note.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
  await prisma.note.delete({ where: { id } });
  return { deleted: true };
}
