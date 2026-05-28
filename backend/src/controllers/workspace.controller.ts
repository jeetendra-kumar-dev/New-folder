import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import * as sectionService from "../services/section.service";
import * as contentTypeService from "../services/content-type.service";
import * as roadmapService from "../services/roadmap.service";
import * as noteService from "../services/note.service";
import * as photoService from "../services/photo.service";
import * as videoService from "../services/video.service";
import * as graphicService from "../services/graphic.service";

export const listSections = asyncHandler(async (req, res) => {
  const sections = await sectionService.listSections(req.user!.id);
  return sendSuccess(res, sections, "Sections loaded");
});

export const createSection = asyncHandler(async (req, res) => {
  const section = await sectionService.createSection(req.user!.id, req.body);
  return sendSuccess(res, section, "Section created", 201);
});

export const updateSection = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const section = await sectionService.updateSection(req.user!.id, id, req.body);
  return sendSuccess(res, section, "Section updated");
});

export const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await sectionService.deleteSection(req.user!.id, id);
  return sendSuccess(res, result, "Section deleted");
});

export const listContentTypes = asyncHandler(async (req, res) => {
  const types = await contentTypeService.listContentTypes(req.user!.id);
  return sendSuccess(res, types, "Content types loaded");
});

export const createContentType = asyncHandler(async (req, res) => {
  const type = await contentTypeService.createContentType(req.user!.id, req.body);
  return sendSuccess(res, type, "Content type created", 201);
});

export const updateContentType = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const type = await contentTypeService.updateContentType(req.user!.id, id, req.body);
  return sendSuccess(res, type, "Content type updated");
});

export const deleteContentType = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await contentTypeService.deleteContentType(req.user!.id, id);
  return sendSuccess(res, result, "Content type deleted");
});

export const listRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await roadmapService.listRoadmaps(req.user!.id);
  return sendSuccess(res, roadmaps, "Roadmaps loaded");
});

export const createRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await roadmapService.createRoadmap(req.user!.id, req.body);
  return sendSuccess(res, roadmap, "Roadmap created", 201);
});

export const updateRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const roadmap = await roadmapService.updateRoadmap(req.user!.id, id, req.body);
  return sendSuccess(res, roadmap, "Roadmap updated");
});

export const deleteRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await roadmapService.deleteRoadmap(req.user!.id, id);
  return sendSuccess(res, result, "Roadmap deleted");
});

export const listNotes = asyncHandler(async (req, res) => {
  const notes = await noteService.listNotes(req.user!.id);
  return sendSuccess(res, notes, "Notes loaded");
});

export const createNote = asyncHandler(async (req, res) => {
  const note = await noteService.createNote(req.user!.id, req.body);
  return sendSuccess(res, note, "Note created", 201);
});

export const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const note = await noteService.updateNote(req.user!.id, id, req.body);
  return sendSuccess(res, note, "Note updated");
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await noteService.deleteNote(req.user!.id, id);
  return sendSuccess(res, result, "Note deleted");
});

export const listPhotos = asyncHandler(async (req, res) => {
  const photos = await photoService.listPhotos(req.user!.id);
  return sendSuccess(res, photos, "Photos loaded");
});

export const createPhoto = asyncHandler(async (req, res) => {
  const photo = await photoService.createPhoto(req.user!.id, req.body);
  return sendSuccess(res, photo, "Photo created", 201);
});

export const updatePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const photo = await photoService.updatePhoto(req.user!.id, id, req.body);
  return sendSuccess(res, photo, "Photo updated");
});

export const deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await photoService.deletePhoto(req.user!.id, id);
  return sendSuccess(res, result, "Photo deleted");
});

export const listVideos = asyncHandler(async (req, res) => {
  const videos = await videoService.listVideos(req.user!.id);
  return sendSuccess(res, videos, "Videos loaded");
});

export const createVideo = asyncHandler(async (req, res) => {
  const video = await videoService.createVideo(req.user!.id, req.body);
  return sendSuccess(res, video, "Video created", 201);
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const video = await videoService.updateVideo(req.user!.id, id, req.body);
  return sendSuccess(res, video, "Video updated");
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await videoService.deleteVideo(req.user!.id, id);
  return sendSuccess(res, result, "Video deleted");
});

export const listGraphics = asyncHandler(async (req, res) => {
  const graphics = await graphicService.listGraphics(req.user!.id);
  return sendSuccess(res, graphics, "Graphics loaded");
});

export const createGraphic = asyncHandler(async (req, res) => {
  const graphic = await graphicService.createGraphic(req.user!.id, req.body);
  return sendSuccess(res, graphic, "Graphic created", 201);
});

export const updateGraphic = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const graphic = await graphicService.updateGraphic(req.user!.id, id, req.body);
  return sendSuccess(res, graphic, "Graphic updated");
});

export const deleteGraphic = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await graphicService.deleteGraphic(req.user!.id, id);
  return sendSuccess(res, result, "Graphic deleted");
});
