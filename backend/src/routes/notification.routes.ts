import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import { notificationQuerySchema } from "../types/notification";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);
router.get("/", validate({ query: notificationQuerySchema }), notificationController.listNotifications);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.patch("/:id/read", validate({ params: idParamSchema }), notificationController.markNotificationRead);
router.delete("/:id", validate({ params: idParamSchema }), notificationController.deleteNotification);

export { router as notificationRoutes };
