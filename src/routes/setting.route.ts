import { Router } from "express";
import { SettingController } from "../controllers/setting.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { SettingValidation } from "../validation/setting.validation";

const router = Router();

const settingController = new SettingController();

router.get("/", authMiddleware(), settingController.getAllSettings);
router.get("/:key", settingController.getSetting);
router.post(
  "/",
  authMiddleware(),
  validateRequest(SettingValidation.createSettingSchema),
  settingController.upsertSetting,
);
router.delete("/:key", authMiddleware(), settingController.deleteSetting);

export default router;
