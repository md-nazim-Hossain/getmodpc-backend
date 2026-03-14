import { Router } from "express";
import { PageController } from "../controllers/page.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { PageValidation } from "../validation/page.validation";

const router = Router();
const pageController = new PageController();

router.get("/", authMiddleware(), pageController.getAllPages);
router.get("/:id", authMiddleware(), pageController.getPageById);
router.get("/slug/:slug", pageController.getPageBySlug);
router.post(
  "/",
  authMiddleware(),
  validateRequest(PageValidation.createPageSchema),
  pageController.createPage,
);
router.patch(
  "/:id",
  authMiddleware(),
  validateRequest(PageValidation.updatePageSchema),
  pageController.updatePage,
);
router.delete("/:id", authMiddleware(), pageController.deletePage);

export default router;
