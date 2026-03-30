import { Router } from "express";
import { FaqController } from "../controllers/faq.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { FaqValidation } from "../validation/faqs.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const faqController = new FaqController();

router.get("/", authMiddleware(), faqController.getAllFAQs);
router.get("/platform/:platform", faqController.getFaqByPlatform);
router.get("/:id", authMiddleware(), faqController.getFaqById);
router.post(
  "/",
  validateRequest(FaqValidation.createFaqSchema),
  authMiddleware(),
  faqController.createFaq,
);
router.patch(
  "/:id",
  validateRequest(FaqValidation.updateFaqSchema),
  authMiddleware(),
  faqController.updateFaq,
);
router.delete("/:id", authMiddleware(), faqController.deleteFaq);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  faqController.deleteMultipleFaq,
);

export default router;
