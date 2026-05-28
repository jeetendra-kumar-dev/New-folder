import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as goalService from "../services/goal.service";

export const listGoals = asyncHandler(async (req, res) => {
  const goals = await goalService.listGoals(req.user!.id);
  return sendSuccess(res, goals, "Goals loaded");
});

export const createGoal = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.user!.id, req.body);
  return sendSuccess(res, goal, "Goal created", 201);
});

export const updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const goal = await goalService.updateGoal(req.user!.id, id, req.body);
  return sendSuccess(res, goal, "Goal updated");
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await goalService.deleteGoal(req.user!.id, id);
  return sendSuccess(res, result, "Goal deleted");
});
