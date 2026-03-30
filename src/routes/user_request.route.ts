import { Router } from "express";
import { UserAppRequestController } from "../controllers/user_app_request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { UserAppRequestValidation } from "../validation/user_app_request.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const userRequestController = new UserAppRequestController();

router.get("/", authMiddleware(), userRequestController.getAllUserAppRequests);
router.get(
  "/:id",
  authMiddleware(),
  userRequestController.getUserAppRequestById,
);
router.post(
  "/",
  validateRequest(UserAppRequestValidation.createUserAppRequest),
  userRequestController.createUserAppRequest,
);
router.patch(
  "/:id",
  validateRequest(UserAppRequestValidation.updateUserAppRequest),
  authMiddleware(),
  userRequestController.updateUserAppRequest,
);
router.delete(
  "/:id",
  authMiddleware(),
  userRequestController.deleteUserAppRequest,
);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  userRequestController.deleteMultipleUserAppRequests,
);

export default router;
