import { prisma } from "../lib/prisma";
import type { CreateRoadmapInput, UpdateRoadmapInput } from "../types/workspace";
import { AppError } from "../utils/app-error";
import { assertSectionOwnership, assertTypeOwnership } from "./section.service";

const roadmapSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  sectionId: true,
  typeId: true,
  section: { select: { id: true, name: true, color: true } },
  type: { select: { id: true, name: true, color: true } },
  milestones: {
    select: { id: true, title: true, status: true, dueDate: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  createdAt: true,
  updatedAt: true,
} as const;

export async function listRoadmaps(userId: string) {
  return prisma.roadmap.findMany({
    where: { userId },
    select: roadmapSelect,
    orderBy: { updatedAt: "desc" },
  });
}

export async function createRoadmap(userId: string, input: CreateRoadmapInput) {
  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);
  const { milestones, ...data } = input;

  return prisma.roadmap.create({
    data: {
      userId,
      ...data,
      milestones: milestones?.length
        ? {
            create: milestones.map((m, index) => ({
              title: m.title,
              status: m.status ?? "TODO",
              dueDate: m.dueDate,
              sortOrder: m.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    select: roadmapSelect,
  });
}

export async function updateRoadmap(userId: string, id: string, input: UpdateRoadmapInput) {
  const existing = await prisma.roadmap.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Roadmap not found", 404, "ROADMAP_NOT_FOUND");

  await assertSectionOwnership(userId, input.sectionId);
  await assertTypeOwnership(userId, input.typeId);

  const { milestones, ...data } = input;

  return prisma.$transaction(async (tx) => {
    if (milestones) {
      await tx.roadmapMilestone.deleteMany({ where: { roadmapId: id } });
      if (milestones.length) {
        await tx.roadmapMilestone.createMany({
          data: milestones.map((m, index) => ({
            roadmapId: id,
            title: m.title,
            status: m.status ?? "TODO",
            dueDate: m.dueDate,
            sortOrder: m.sortOrder ?? index,
          })),
        });
      }
    }

    return tx.roadmap.update({
      where: { id },
      data,
      select: roadmapSelect,
    });
  });
}

export async function deleteRoadmap(userId: string, id: string) {
  const existing = await prisma.roadmap.findFirst({ where: { id, userId }, select: { id: true } });
  if (!existing) throw new AppError("Roadmap not found", 404, "ROADMAP_NOT_FOUND");
  await prisma.roadmap.delete({ where: { id } });
  return { deleted: true };
}
