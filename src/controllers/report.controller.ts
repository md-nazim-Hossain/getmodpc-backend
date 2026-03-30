import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import httpStatusCode from "http-status-codes";
import pick from "../utils/pick";
import { ReportConstant } from "../const/report.const";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { ReportService } from "../services/report.service";
import { Report } from "../models/report";

export class ReportController {
  private readonly reportService = new ReportService();

  public getAllReports = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, ReportConstant.reportFiltersFields);
    const pagination: IPaginationOptions = pick(req.query, paginationFields);
    const reports = await this.reportService.getAllReports(filters, pagination);
    sendResponse<Report[]>(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      data: reports.data,
      meta: reports.meta,
      message: "Reports fetched successfully",
    });
  });

  public getReportById = catchAsync(async (req: Request, res: Response) => {
    const report = await this.reportService.getReportById(req.params.id);
    sendResponse<Report>(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      data: report,
      message: "Report fetched successfully",
    });
  });

  public createReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.reportService.createReport(req.body);
    sendResponse<Report>(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      data: report,
      message: "Report created successfully",
    });
  });

  public updateReport = catchAsync(async (req: Request, res: Response) => {
    const report = await this.reportService.updateReport(
      req.params.id,
      req.body,
    );
    sendResponse<Report>(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      data: report,
      message: "Report updated successfully",
    });
  });

  public deleteReport = catchAsync(async (req: Request, res: Response) => {
    await this.reportService.deleteReport(req.params.id);
    sendResponse<void>(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      message: "Report deleted successfully",
    });
  });

  public deleteMultipleReports = catchAsync(
    async (req: Request, res: Response) => {
      await this.reportService.deleteMultipleReports(req.body.ids);
      sendResponse<void>(res, {
        statusCode: httpStatusCode.OK,
        success: true,
        message: "Reports deleted successfully",
      });
    },
  );
}
