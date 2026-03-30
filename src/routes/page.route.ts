import { Router } from "express";
import { PageController } from "../controllers/page.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { PageValidation } from "../validation/page.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const pageController = new PageController();

router.get("/", authMiddleware(), pageController.getAllPages);
router.get("/:id", authMiddleware(), pageController.getPageById);
router.get("/slug/:slug", pageController.getPageBySlug);
router.post(
  "/",
  validateRequest(PageValidation.createPageSchema),
  authMiddleware(),
  pageController.createPage,
);
router.patch(
  "/:id",
  validateRequest(PageValidation.updatePageSchema),
  authMiddleware(),
  pageController.updatePage,
);
router.delete("/:id", authMiddleware(), pageController.deletePage);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  pageController.deleteMultiplePages,
);

export default router;
