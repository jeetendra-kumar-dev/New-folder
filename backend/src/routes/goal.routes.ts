import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import { createGoalBodySchema, updateGoalBodySchema } from "../types/goal";
import * as goalController from "../controllers/goal.controller";

const router = Router();

router.use(authenticate);
router.get("/", goalController.listGoals);
router.post("/", validate({ body: createGoalBodySchema }), goalController.createGoal);
router.patch("/:id", validate({ params: idParamSchema, body: updateGoalBodySchema }), goalController.updateGoal);
router.delete("/:id", validate({ params: idParamSchema }), goalController.deleteGoal);

export { router as goalRoutes };
