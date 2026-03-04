import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { TestimonialValidation } from "../validation/testimonial.validation";
import { TestimonialController } from "../controllers/testimonial.controller";

const router = Router();

const testimonialController = new TestimonialController();
router.get("/", authMiddleware(), testimonialController.getAllTestimonials);
router.get("/active", testimonialController.getAllActiveTestimonials);
router.get("/:id", authMiddleware(), testimonialController.getTestimonialById);
router.post(
  "/",
  authMiddleware(),
  validateRequest(TestimonialValidation.createTestimonialSchema),
  testimonialController.createTestimonial,
);
router.patch(
  "/:id",
  authMiddleware(),
  validateRequest(TestimonialValidation.updateTestimonialSchema),
  testimonialController.updateTestimonial,
);
router.delete(
  "/:id",
  authMiddleware(),
  testimonialController.deleteTestimonial,
);

export default router;
