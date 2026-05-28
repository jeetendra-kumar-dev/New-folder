import { getDashboardSummary } from "../services/dashboard.service";
import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

export const summary = asyncHandler(async (req, res) => {
  const result = await getDashboardSummary(req.user!.id);
  return sendSuccess(res, result, "Dashboard summary loaded");
});
