import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { TestimonialValidation } from "../validation/testimonial.validation";
import { TestimonialController } from "../controllers/testimonial.controller";
import { IndexValidation } from "../validation/index.validation";

const router = Router();

const testimonialController = new TestimonialController();
router.get("/", authMiddleware(), testimonialController.getAllTestimonials);
router.get("/active", testimonialController.getAllActiveTestimonials);
router.get("/:id", authMiddleware(), testimonialController.getTestimonialById);
router.post(
  "/",
  validateRequest(TestimonialValidation.createTestimonialSchema),
  authMiddleware(),
  testimonialController.createTestimonial,
);
router.patch(
  "/:id",
  validateRequest(TestimonialValidation.updateTestimonialSchema),
  authMiddleware(),
  testimonialController.updateTestimonial,
);
router.delete(
  "/:id",
  authMiddleware(),
  testimonialController.deleteTestimonial,
);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  testimonialController.deleteMultipleTestimonials,
);

export default router;
