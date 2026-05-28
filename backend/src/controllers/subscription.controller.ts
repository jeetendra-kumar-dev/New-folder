import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as subscriptionService from "../services/subscription.service";

export const listSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.listSubscriptions(req.user!.id);
  return sendSuccess(res, subscriptions, "Subscriptions loaded");
});

export const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(req.user!.id, req.body);
  return sendSuccess(res, subscription, "Subscription created", 201);
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const subscription = await subscriptionService.updateSubscription(req.user!.id, id, req.body);
  return sendSuccess(res, subscription, "Subscription updated");
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await subscriptionService.deleteSubscription(req.user!.id, id);
  return sendSuccess(res, result, "Subscription deleted");
});
