import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../types/common";
import {
  createContentTypeBodySchema,
  createGraphicBodySchema,
  createNoteBodySchema,
  createPhotoBodySchema,
  createRoadmapBodySchema,
  createSectionBodySchema,
  createVideoBodySchema,
  updateContentTypeBodySchema,
  updateGraphicBodySchema,
  updateNoteBodySchema,
  updatePhotoBodySchema,
  updateRoadmapBodySchema,
  updateSectionBodySchema,
  updateVideoBodySchema,
} from "../types/workspace";
import * as workspaceController from "../controllers/workspace.controller";

const router = Router();

router.use(authenticate);

router.get("/sections", workspaceController.listSections);
router.post("/sections", validate({ body: createSectionBodySchema }), workspaceController.createSection);
router.patch("/sections/:id", validate({ params: idParamSchema, body: updateSectionBodySchema }), workspaceController.updateSection);
router.delete("/sections/:id", validate({ params: idParamSchema }), workspaceController.deleteSection);

router.get("/content-types", workspaceController.listContentTypes);
router.post("/content-types", validate({ body: createContentTypeBodySchema }), workspaceController.createContentType);
router.patch("/content-types/:id", validate({ params: idParamSchema, body: updateContentTypeBodySchema }), workspaceController.updateContentType);
router.delete("/content-types/:id", validate({ params: idParamSchema }), workspaceController.deleteContentType);

router.get("/roadmaps", workspaceController.listRoadmaps);
router.post("/roadmaps", validate({ body: createRoadmapBodySchema }), workspaceController.createRoadmap);
router.patch("/roadmaps/:id", validate({ params: idParamSchema, body: updateRoadmapBodySchema }), workspaceController.updateRoadmap);
router.delete("/roadmaps/:id", validate({ params: idParamSchema }), workspaceController.deleteRoadmap);

router.get("/notes", workspaceController.listNotes);
router.post("/notes", validate({ body: createNoteBodySchema }), workspaceController.createNote);
router.patch("/notes/:id", validate({ params: idParamSchema, body: updateNoteBodySchema }), workspaceController.updateNote);
router.delete("/notes/:id", validate({ params: idParamSchema }), workspaceController.deleteNote);

router.get("/photos", workspaceController.listPhotos);
router.post("/photos", validate({ body: createPhotoBodySchema }), workspaceController.createPhoto);
router.patch("/photos/:id", validate({ params: idParamSchema, body: updatePhotoBodySchema }), workspaceController.updatePhoto);
router.delete("/photos/:id", validate({ params: idParamSchema }), workspaceController.deletePhoto);

router.get("/videos", workspaceController.listVideos);
router.post("/videos", validate({ body: createVideoBodySchema }), workspaceController.createVideo);
router.patch("/videos/:id", validate({ params: idParamSchema, body: updateVideoBodySchema }), workspaceController.updateVideo);
router.delete("/videos/:id", validate({ params: idParamSchema }), workspaceController.deleteVideo);

router.get("/graphics", workspaceController.listGraphics);
router.post("/graphics", validate({ body: createGraphicBodySchema }), workspaceController.createGraphic);
router.patch("/graphics/:id", validate({ params: idParamSchema, body: updateGraphicBodySchema }), workspaceController.updateGraphic);
router.delete("/graphics/:id", validate({ params: idParamSchema }), workspaceController.deleteGraphic);

export { router as workspaceRoutes };
