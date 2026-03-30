import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { AdminValidation } from "../validation/admin.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const adminController = new AdminController();

router.get("/", authMiddleware(), adminController.getAllAdminUsers);
router.get("/:id", authMiddleware(), adminController.getAdminUserById);

router.post(
  "/add",
  validateRequest(AdminValidation.createAdminSchema),
  authMiddleware(),
  adminController.createAdminUser,
);

router.patch(
  "/:id",
  validateRequest(AdminValidation.updateAdminSchema),
  authMiddleware(),
  adminController.updateAdminUser,
);

router.delete("/:id", authMiddleware(), adminController.deleteAdminUser);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  adminController.deleteMultipleAdminUser,
);

export default router;
