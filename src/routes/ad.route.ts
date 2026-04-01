import { Router } from "express";
import { AdController } from "../controllers/ad.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { AdValidation } from "../validation/ad.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();

const adController = new AdController();

router.get("/", authMiddleware(), adController.getAllAds);
router.get("/active", adController.getAllActiveAds);
router.get("/:id", authMiddleware(), adController.getAdById);
router.post(
  "/",
  validateRequest(AdValidation.createAdSchema),
  authMiddleware(),
  adController.createAd,
);
router.patch(
  "/:id",
  validateRequest(AdValidation.updateAdSchema),
  authMiddleware(),
  adController.updateAd,
);
router.delete("/:id", authMiddleware(), adController.deleteAd);
router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  adController.deleteMultipleAds,
);

export default router;
