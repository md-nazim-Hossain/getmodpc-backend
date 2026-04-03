import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { AppValidation } from "../validation/app.validation";
import { ScrappingController } from "../controllers/scrapping.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const scrappingController = new ScrappingController();

router.get(
  "/get-search-playstore-apps",
  authMiddleware(),
  scrappingController.getPlayStoreAppsByAppName,
);
router.post(
  "/playstore-app-by-url",
  validateRequest(AppValidation.getAppScrapingSchema),
  authMiddleware(),
  scrappingController.getPlayStoreAppByUrl,
);

router.post(
  "/check-app-version/:id",
  validateRequest(AppValidation.checkAppVersionSchema),
  authMiddleware(),
  scrappingController.checkUpdate,
);

//============================= Liteapks App=====================//
router.post(
  "/liteapks-app-by-url",
  validateRequest(AppValidation.getAppScrapingSchema),
  scrappingController.getLiteApkAppByUrl,
);
router.get(
  "/liteapks-app-by-type",
  authMiddleware(),
  scrappingController.getAllLiteApkLatestAppsAndGames,
);

export default router;
