import { Request, Response } from "express";
import { ReportReasonService } from "../services/report_reason.service";
import { catchAsync } from "../utils/catchAsync";
import { paginationFields } from "../const/pagination.const";
import pick from "../utils/pick";
import { ReportConstant } from "../const/report.const";
import { IPaginationOptions } from "../types";
import { ReportReason } from "../models/report_reason";
import sendResponse from "../utils/ApiResponse";
import httpStatusCodes from "http-status-codes";

export class ReportReasonController {
  private readonly reportReasonService = new ReportReasonService();

  public getAllReportReasons = catchAsync(
    async (req: Request, res: Response) => {
      const filters = pick(req.query, ReportConstant.reportReasonFiltersFields);
      const paginationOptions: IPaginationOptions = pick(
        req.query,
        paginationFields,
      );
      const reportReasons = await this.reportReasonService.getAllReportReasons(
        filters,
        paginationOptions,
      );
      sendResponse<ReportReason[]>(res, {
        message: "Report reasons fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: reportReasons.data,
        meta: reportReasons.meta,
        success: true,
      });
    },
  );

  public getAllActiveReportReasons = catchAsync(
    async (req: Request, res: Response) => {
      const reportReasons =
        await this.reportReasonService.getAllActiveReportReasons();
      sendResponse<ReportReason[]>(res, {
        message: "Report reasons fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: reportReasons,
        success: true,
      });
    },
  );

  public getReportReasonById = catchAsync(
    async (req: Request, res: Response) => {
      const reportReason = await this.reportReasonService.getReportReasonById(
        req.params.id,
      );
      sendResponse<ReportReason>(res, {
        message: "Report reason fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: reportReason,
        success: true,
      });
    },
  );

  public createReportReason = catchAsync(
    async (req: Request, res: Response) => {
      const reportReason = await this.reportReasonService.createReportReason(
        req.body,
      );
      sendResponse<ReportReason>(res, {
        message: "Report reason created successfully",
        statusCode: httpStatusCodes.CREATED,
        data: reportReason,
        success: true,
      });
    },
  );

  public updateReportReason = catchAsync(
    async (req: Request, res: Response) => {
      const reportReason = await this.reportReasonService.updateReportReason(
        req.params.id,
        req.body,
      );
      sendResponse<ReportReason>(res, {
        message: "Report reason updated successfully",
        statusCode: httpStatusCodes.OK,
        data: reportReason,
        success: true,
      });
    },
  );

  public deleteReportReason = catchAsync(
    async (req: Request, res: Response) => {
      await this.reportReasonService.deleteReportReason(req.params.id);
      sendResponse<ReportReason>(res, {
        message: "Report reason deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );

  public deleteMultipleReportReasons = catchAsync(
    async (req: Request, res: Response) => {
      await this.reportReasonService.deleteMultipleReportReason(req.body.ids);
      sendResponse<ReportReason>(res, {
        message: "Report reasons deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );
}
