import { Router } from "express";
import { ReportReasonController } from "../controllers/report_reason.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { ReportValidation } from "../validation/report.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();

const reportReasonController = new ReportReasonController();

router.get("/", authMiddleware(), reportReasonController.getAllReportReasons);
router.get("/active", reportReasonController.getAllActiveReportReasons);
router.get(
  "/:id",
  authMiddleware(),
  reportReasonController.getReportReasonById,
);
router.post(
  "/",
  validateRequest(ReportValidation.createReportReasonSchema),
  authMiddleware(),
  reportReasonController.createReportReason,
);
router.patch(
  "/:id",
  validateRequest(ReportValidation.updateReportReasonSchema),
  authMiddleware(),
  reportReasonController.updateReportReason,
);
router.delete(
  "/:id",
  authMiddleware(),
  reportReasonController.deleteReportReason,
);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  reportReasonController.deleteMultipleReportReasons,
);

export default router;
