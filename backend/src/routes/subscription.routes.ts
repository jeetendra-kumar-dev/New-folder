import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import { createSubscriptionBodySchema, updateSubscriptionBodySchema } from "../types/subscription";
import * as subscriptionController from "../controllers/subscription.controller";

const router = Router();

router.use(authenticate);
router.get("/", subscriptionController.listSubscriptions);
router.post("/", validate({ body: createSubscriptionBodySchema }), subscriptionController.createSubscription);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateSubscriptionBodySchema }),
  subscriptionController.updateSubscription,
);
router.delete("/:id", validate({ params: idParamSchema }), subscriptionController.deleteSubscription);

export { router as subscriptionRoutes };
