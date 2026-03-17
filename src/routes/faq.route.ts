import { Router } from "express";
import { FaqController } from "../controllers/faq.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { FaqValidation } from "../validation/faqs.validation";

const router = Router();
const faqController = new FaqController();

router.get("/", authMiddleware(), faqController.getAllFAQs);
router.get("/type/:type", faqController.getFaqByType);
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

export default router;
