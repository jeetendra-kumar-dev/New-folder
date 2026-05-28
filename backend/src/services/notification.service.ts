import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { NotificationQuery } from "../types/notification";
import { AppError } from "../utils/app-error";

const notificationSelect = {
  id: true,
  type: true,
  message: true,
  isRead: true,
  readAt: true,
  metadata: true,
  subscriptionId: true,
  goalId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NotificationSelect;

type NotificationRecord = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

function serializeNotification(notification: NotificationRecord) {
  return notification;
}

export async function createNotification(input: Prisma.NotificationUncheckedCreateInput) {
  return prisma.notification.create({
    data: input,
    select: notificationSelect,
  });
}

export async function listNotifications(userId: string, query: NotificationQuery) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    },
    select: notificationSelect,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return {
    unreadCount,
    notifications: notifications.map(serializeNotification),
  };
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    select: notificationSelect,
  });

  return serializeNotification(updated);
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { updatedCount: result.count };
}

export async function deleteNotification(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  await prisma.notification.delete({ where: { id } });
  return { deleted: true };
}
