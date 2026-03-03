import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { upload } from "../middlewares/multer.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const mediaController = new MediaController();

router.get("/", authMiddleware(), mediaController.getAllMedia);
router.get("/:id", authMiddleware(), mediaController.getMediaById);

router.post(
  "/",
  authMiddleware(),
  upload.array("media", 10),
  mediaController.addMultipleMedia,
);

router.post(
  "/delete-medias",
  authMiddleware(),
  mediaController.deleteMultipleMedia,
);

export default router;
