import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { upload } from "../middlewares/multer.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { MediaValidation } from "../validation/media.validation";

const router = Router();
const mediaController = new MediaController();

router.get("/", authMiddleware(), mediaController.getAllMedias);
router.get("/folder", authMiddleware(), mediaController.getAllFolderMedias);
router.get("/:key", mediaController.getMediaByKey);

router.post(
  "/",
  authMiddleware(),
  upload.array("medias", 15),
  mediaController.uploadMediasToBucket,
);

router.post(
  "/create-folder",
  validateRequest(MediaValidation.createFolderSchema),
  authMiddleware(),
  mediaController.createFolder,
);

router.put(
  "/rename-folder",
  validateRequest(MediaValidation.renameFolderSchema),
  authMiddleware(),
  mediaController.renameFolder,
);
router.post(
  "/delete-folder",
  validateRequest(MediaValidation.createFolderSchema),
  authMiddleware(),
  mediaController.deleteFolder,
);
router.post(
  "/bulk-delete",
  validateRequest(MediaValidation.deleteMediasSchema),
  authMiddleware(),
  mediaController.deletedMedias,
);

export default router;
