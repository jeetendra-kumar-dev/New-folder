import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import { chatBodySchema, runAiModelBodySchema } from "../types/ai";
import * as aiController from "../controllers/ai.controller";

const router = Router();

router.use(authenticate);

router.get("/models", aiController.listModels);
router.post("/models/run", validate({ body: runAiModelBodySchema }), aiController.runModel);
router.get("/conversations", aiController.listConversations);
router.get("/conversations/:id", validate({ params: idParamSchema }), aiController.getConversation);
router.delete("/conversations/:id", validate({ params: idParamSchema }), aiController.deleteConversation);
router.post("/chat", validate({ body: chatBodySchema }), aiController.chat);

export { router as aiRoutes };
