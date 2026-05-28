import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import { createMemoryBodySchema, updateMemoryBodySchema } from "../types/memory";
import * as memoryController from "../controllers/memory.controller";

const router = Router();

router.use(authenticate);
router.get("/", memoryController.listMemories);
router.post("/", validate({ body: createMemoryBodySchema }), memoryController.createMemory);
router.patch("/:id", validate({ params: idParamSchema, body: updateMemoryBodySchema }), memoryController.updateMemory);
router.delete("/:id", validate({ params: idParamSchema }), memoryController.deleteMemory);

export { router as memoryRoutes };
