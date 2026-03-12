import { Router } from "express";
import { AppController } from "../controllers/app.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

const appController = new AppController();

router.get("/", authMiddleware(), appController.getAllApps);
router.get("/sliders", appController.getAllSliderApps);
router.get("/searchable", appController.getAllSearchableApps);
router.get("/slug/:slug", appController.getAppBySlug);
router.get("/:id", authMiddleware(), appController.getAppById);
router.post("/", authMiddleware(), appController.createApp);
router.patch("/:id", authMiddleware(), appController.updateApp);
router.post("/deletes", authMiddleware(), appController.softDeletedApps);
router.post("/restores", authMiddleware(), appController.restoreApps);
router.post("/delete/permanently", authMiddleware(), appController.emptyTrash);

export default router;
