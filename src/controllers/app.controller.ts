import { Request, Response } from "express";
import { AppService } from "../services/app.service";
import { catchAsync } from "../utils/catchAsync";
import pick from "../utils/pick";
import { AppConstant } from "../const/app.const";
import { IAppResponseDTO, IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { App } from "../models/app.model";
import httpStatusCodes from "http-status-codes";
import { DeleteResult, UpdateResult } from "typeorm";
import ApiError from "../utils/ApiError";

export class AppController {
  private readonly appService = new AppService();

  public getAllApps = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, AppConstant.appFilterableFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const apps = await this.appService.getAllApps(filters, paginationOptions);
    sendResponse<App[]>(res, {
      message: "Apps fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: apps.data,
      meta: apps.meta,
      success: true,
    });
  });

  public getAllSliderApps = catchAsync(async (req: Request, res: Response) => {
    const apps = await this.appService.getAllSliderApps();
    sendResponse<App[]>(res, {
      message: "Apps fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: apps,
      success: true,
    });
  });

  public getAppById = catchAsync(async (req: Request, res: Response) => {
    const app = await this.appService.getAppById(req.params.id);
    sendResponse<IAppResponseDTO>(res, {
      message: "App fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: app,
      success: true,
    });
  });

  public getAppBySlug = catchAsync(async (req: Request, res: Response) => {
    const app = await this.appService.getAppBySlug(req.params.slug);
    sendResponse<IAppResponseDTO>(res, {
      message: "App fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: app,
      success: true,
    });
  });

  public getAllSearchableApps = catchAsync(
    async (req: Request, res: Response) => {
      const { search } = req.query;
      const apps = await this.appService.getAllSearchableApps(search as string);
      sendResponse<App[]>(res, {
        message: "Apps fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: apps,
        success: true,
      });
    },
  );

  public createApp = catchAsync(async (req: Request, res: Response) => {
    const app = await this.appService.createApp(req.body);
    sendResponse<Pick<App, "id" | "slug" | "name">>(res, {
      message: "App created successfully",
      statusCode: httpStatusCodes.CREATED,
      data: app,
      success: true,
    });
  });

  public updateApp = catchAsync(async (req: Request, res: Response) => {
    const app = await this.appService.updateApp(req.params.id, req.body);
    sendResponse<Pick<App, "id" | "slug" | "name">>(res, {
      message: "App updated successfully",
      statusCode: httpStatusCodes.OK,
      data: app,
      success: true,
    });
  });

  public givenAppRating = catchAsync(async (req: Request, res: Response) => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip;

    if (!ip || (process.env.NODE_ENV === "production" && ip === "::1")) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "Unable to detect client IP or IP is invalid",
      );
    }

    const result = await this.appService.givenAppRating(req.params.id, ip);

    sendResponse<boolean>(res, {
      success: true,
      statusCode: httpStatusCodes.OK,
      message: "App rating given successfully",
      data: result,
    });
  });

  public softDeletedApps = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    const apps = await this.appService.softDeletedApps(ids);
    sendResponse<UpdateResult>(res, {
      message: "Apps Soft deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: apps,
      success: true,
    });
  });

  public restoreApps = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    const apps = await this.appService.restoreApps(ids);
    sendResponse<UpdateResult>(res, {
      message: "Apps restored successfully",
      statusCode: httpStatusCodes.OK,
      data: apps,
      success: true,
    });
  });

  public emptyTrash = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    const apps = await this.appService.emptyTrash(ids);
    sendResponse<DeleteResult>(res, {
      message: "Apps permanently deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: apps,
      success: true,
    });
  });
}
