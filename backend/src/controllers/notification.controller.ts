import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as notificationService from "../services/notification.service";
import type { NotificationQuery } from "../types/notification";

export const listNotifications = asyncHandler(async (req, res) => {
  const query = (res.locals.validatedQuery ?? {}) as NotificationQuery;
  const result = await notificationService.listNotifications(req.user!.id, query);
  return sendSuccess(res, result, "Notifications loaded");
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const notification = await notificationService.markNotificationRead(req.user!.id, id);
  return sendSuccess(res, notification, "Notification marked as read");
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user!.id);
  return sendSuccess(res, result, "Notifications marked as read");
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await notificationService.deleteNotification(req.user!.id, id);
  return sendSuccess(res, result, "Notification deleted");
});
