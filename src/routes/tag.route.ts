import { Router } from "express";
import { TagController } from "../controllers/tag.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { TagDeveloperValidation } from "../validation/tag-developer.validation";

const router = Router();

const tagController = new TagController();
router.get("/", authMiddleware(), tagController.getAllTags);
router.get("/:id", authMiddleware(), tagController.getTagById);
router.get("/slug/:slug", authMiddleware(), tagController.getTagBySlug);
router.post(
  "/",
  validateRequest(TagDeveloperValidation.createTagDeveloperSchema),
  authMiddleware(),
  tagController.createTag,
);
router.patch(
  "/:id",
  validateRequest(TagDeveloperValidation.updateTagDeveloperSchema),
  authMiddleware(),
  tagController.updateTag,
);
router.delete("/:id", authMiddleware(), tagController.deleteTag);

export default router;
