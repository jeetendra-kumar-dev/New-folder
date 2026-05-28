import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateMemoryInput, UpdateMemoryInput } from "../types/memory";
import { AppError } from "../utils/app-error";
import { createNotification } from "./notification.service";

const memorySelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  importance: true,
  source: true,
  metadata: true,
  lastAccessedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MemorySelect;

export async function listMemories(userId: string) {
  return prisma.memory.findMany({
    where: { userId },
    select: memorySelect,
    orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createMemory(userId: string, input: CreateMemoryInput) {
  const memory = await prisma.memory.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      content: input.content,
      importance: input.importance,
      source: input.source,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      lastAccessedAt: new Date(),
    },
    select: memorySelect,
  });

  await createNotification({
    userId,
    type: "MEMORY_INSIGHT",
    message: `Memory saved${memory.title ? `: ${memory.title}` : "."}`,
    metadata: { memoryId: memory.id, type: memory.type },
  });

  return memory;
}

export async function updateMemory(userId: string, id: string, input: UpdateMemoryInput) {
  const existing = await prisma.memory.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Memory not found", 404, "MEMORY_NOT_FOUND");
  }

  return prisma.memory.update({
    where: { id },
    data: {
      type: input.type,
      title: input.title,
      content: input.content,
      importance: input.importance,
      source: input.source,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      lastAccessedAt: new Date(),
    },
    select: memorySelect,
  });
}

export async function deleteMemory(userId: string, id: string) {
  const existing = await prisma.memory.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Memory not found", 404, "MEMORY_NOT_FOUND");
  }

  await prisma.memory.delete({ where: { id } });
  return { deleted: true };
}
