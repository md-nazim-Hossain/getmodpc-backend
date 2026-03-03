import { Router } from "express";
import { AdminAuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { AuthValidation } from "../validation/auth.validation";

const router = Router();
const adminAuthController = new AdminAuthController();

router.post("/login", adminAuthController.loginAdmin);
router.get("/profile", authMiddleware(), adminAuthController.getMyProfile);
router.post(
  "/change-password",
  authMiddleware(),
  validateRequest(AuthValidation.changePasswordSchema),
  adminAuthController.changeAdminPassword,
);
router.post("/logout", authMiddleware(), adminAuthController.logoutAdmin);
router.post("/refresh-token", adminAuthController.adminRefreshToken);
router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  adminAuthController.adminForgetPassword,
);
router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  adminAuthController.adminResetPassword,
);
export default router;
