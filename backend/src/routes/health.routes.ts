import { Router } from "express";
import * as healthController from "../controllers/health.controller";

const router = Router();

router.get("/", healthController.healthCheck);
router.get("/ready", healthController.readinessCheck);

export { router as healthRoutes };
