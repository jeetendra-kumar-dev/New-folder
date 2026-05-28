import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateGoalInput, UpdateGoalInput } from "../types/goal";
import { AppError } from "../utils/app-error";
import { createNotification } from "./notification.service";

const goalSelect = {
  id: true,
  title: true,
  description: true,
  totalDays: true,
  completedDays: true,
  progressPercent: true,
  status: true,
  startedAt: true,
  targetDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GoalSelect;

type GoalRecord = Prisma.GoalGetPayload<{ select: typeof goalSelect }>;

function calculateProgress(totalDays: number, completedDays: number) {
  return Math.min(100, Math.round((completedDays / totalDays) * 10000) / 100);
}

function serializeGoal(goal: GoalRecord) {
  return {
    ...goal,
    progressPercent: Number(goal.progressPercent),
  };
}

export async function listGoals(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    select: goalSelect,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return goals.map(serializeGoal);
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const progressPercent = calculateProgress(input.totalDays, input.completedDays);
  const status = input.completedDays >= input.totalDays ? "COMPLETED" : input.status;

  const goal = await prisma.goal.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      totalDays: input.totalDays,
      completedDays: input.completedDays,
      progressPercent,
      status,
      startedAt: input.startedAt ? new Date(input.startedAt) : undefined,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      completedAt: status === "COMPLETED" ? new Date() : undefined,
    },
    select: goalSelect,
  });

  await createNotification({
    userId,
    goalId: goal.id,
    type: "GOAL_REMINDER",
    message: `Goal created: ${goal.title}.`,
    metadata: { progressPercent },
  });

  return serializeGoal(goal);
}

export async function updateGoal(userId: string, id: string, input: UpdateGoalInput) {
  const existing = await prisma.goal.findFirst({
    where: { id, userId },
    select: { id: true, totalDays: true, completedDays: true },
  });

  if (!existing) {
    throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");
  }

  const totalDays = input.totalDays ?? existing.totalDays;
  const completedDays = input.completedDays ?? existing.completedDays;

  if (completedDays > totalDays) {
    throw new AppError("completedDays cannot be greater than totalDays", 422, "INVALID_GOAL_PROGRESS");
  }

  const progressPercent = calculateProgress(totalDays, completedDays);
  const status = completedDays >= totalDays ? "COMPLETED" : input.status;

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      totalDays: input.totalDays,
      completedDays: input.completedDays,
      progressPercent,
      status,
      startedAt: input.startedAt ? new Date(input.startedAt) : undefined,
      targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
      completedAt: status === "COMPLETED" ? new Date() : status ? null : undefined,
    },
    select: goalSelect,
  });

  if (updated.status === "COMPLETED") {
    await createNotification({
      userId,
      goalId: updated.id,
      type: "GOAL_REMINDER",
      message: `Goal completed: ${updated.title}.`,
      metadata: { progressPercent: Number(updated.progressPercent) },
    });
  }

  return serializeGoal(updated);
}

export async function deleteGoal(userId: string, id: string) {
  const existing = await prisma.goal.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Goal not found", 404, "GOAL_NOT_FOUND");
  }

  await prisma.goal.delete({ where: { id } });
  return { deleted: true };
}
