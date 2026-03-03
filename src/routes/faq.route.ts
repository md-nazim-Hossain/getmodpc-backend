import { Router } from "express";
import { FaqController } from "../controllers/faq.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const faqController = new FaqController();

router.get("/", authMiddleware(), faqController.getAllFAQs);
router.get("/:id", authMiddleware(), faqController.getFaqById);
router.post("/", authMiddleware(), faqController.createFaq);
router.patch("/:id", authMiddleware(), faqController.updateFaq);
router.delete("/:id", authMiddleware(), faqController.deleteFaq);

export default router;
