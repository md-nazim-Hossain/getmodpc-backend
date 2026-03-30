import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { ReportValidation } from "../validation/report.validation";
import { IndexValidation } from "../validation/index.validation";

const router = Router();
const reportController = new ReportController();

router.get("/", authMiddleware(), reportController.getAllReports);
router.get("/:id", authMiddleware(), reportController.getReportById);
router.post(
  "/",
  validateRequest(ReportValidation.createReportSchema),
  reportController.createReport,
);
router.patch(
  "/:id",
  validateRequest(ReportValidation.updateReportSchema),
  reportController.updateReport,
);
router.delete("/:id", authMiddleware(), reportController.deleteReport);

router.post(
  "/bulk-delete",
  validateRequest(IndexValidation.deleteMultipleItemSchema),
  authMiddleware(),
  reportController.deleteMultipleReports,
);

export default router;
