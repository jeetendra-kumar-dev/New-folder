import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as memoryService from "../services/memory.service";

export const listMemories = asyncHandler(async (req, res) => {
  const memories = await memoryService.listMemories(req.user!.id);
  return sendSuccess(res, memories, "Memories loaded");
});

export const createMemory = asyncHandler(async (req, res) => {
  const memory = await memoryService.createMemory(req.user!.id, req.body);
  return sendSuccess(res, memory, "Memory saved", 201);
});

export const updateMemory = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const memory = await memoryService.updateMemory(req.user!.id, id, req.body);
  return sendSuccess(res, memory, "Memory updated");
});

export const deleteMemory = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await memoryService.deleteMemory(req.user!.id, id);
  return sendSuccess(res, result, "Memory deleted");
});
