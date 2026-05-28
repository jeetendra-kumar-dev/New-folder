import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { goalRoutes } from "./goal.routes";
import { healthRoutes } from "./health.routes";
import { memoryRoutes } from "./memory.routes";
import { notificationRoutes } from "./notification.routes";
import { subscriptionRoutes } from "./subscription.routes";

import { aiRoutes } from "./ai.routes";
import { workspaceRoutes } from "./workspace.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/goals", goalRoutes);
router.use("/memories", memoryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/workspace", workspaceRoutes);
router.use("/ai", aiRoutes);

export { router as apiRoutes };
