import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { TagDeveloperValidation } from "../validation/tag-developer.validation";
import { DeveloperController } from "../controllers/developer.controller";
import { IndexValidation } from "../validation/index.validation";

const router = Router();

const developerController = new DeveloperController();
router.get("/", authMiddleware(), developerController.getAllDevelopers);
router.get("/:id", authMiddleware(), developerController.getDeveloperById);
router.get(
  "/slug/:slug",
  authMiddleware(),
  developerController.getDeveloperBySlug,
);
router.post(
  "/",
  validateRequest(TagDeveloperValidation.createTagDeveloperSchema),
  authMiddleware(),
  developerController.createDeveloper,
);
router.patch(
  "/:id",
  validateRequest(TagDeveloperValidation.updateTagDeveloperSchema),
  authMiddleware(),
  developerController.updateDeveloper,
);
router.delete("/:id", authMiddleware(), developerController.deleteDeveloper);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  developerController.deleteMultipleDevelopers,
);

export default router;
