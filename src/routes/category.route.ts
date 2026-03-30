import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import validateRequest from "../middlewares/validateRequest";
import { CategoryValidation } from "../validation/category.validation";
import { authMiddleware } from "../middlewares/auth.middleware";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const categoryController = new CategoryController();

router.get("/", authMiddleware(), categoryController.getAllCategories);
router.get("/group-by-parent-cat", categoryController.getGroupedCategories);
router.get("/:id", authMiddleware(), categoryController.getCategoryById);
router.post(
  "/",
  validateRequest(CategoryValidation.createCategorySchema),
  authMiddleware(),
  categoryController.createCategory,
);
router.patch(
  "/:id",
  validateRequest(CategoryValidation.updateCategorySchema),
  authMiddleware(),
  categoryController.updateCategory,
);
router.delete("/:id", authMiddleware(), categoryController.deleteCategory);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  categoryController.deleteMultipleCategories,
);

export default router;
