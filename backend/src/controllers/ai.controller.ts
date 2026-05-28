import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as aiModelsService from "../services/ai-models.service";
import * as aiService from "../services/ai.service";

export const listModels = asyncHandler(async (_req, res) => {
  const models = aiModelsService.listModels();
  return sendSuccess(res, models, "AI models loaded");
});

export const runModel = asyncHandler(async (req, res) => {
  const result = await aiModelsService.runModel(req.user!.id, req.body);
  return sendSuccess(res, result, "AI model run completed");
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await aiService.listConversations(req.user!.id);
  return sendSuccess(res, conversations, "Conversations loaded");
});

export const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const conversation = await aiService.getConversation(req.user!.id, id);
  return sendSuccess(res, conversation, "Conversation loaded");
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await aiService.deleteConversation(req.user!.id, id);
  return sendSuccess(res, result, "Conversation deleted");
});

export const chat = asyncHandler(async (req, res) => {
  const result = await aiService.chat(req.user!.id, req.body);
  return sendSuccess(res, result, "Message sent");
});
