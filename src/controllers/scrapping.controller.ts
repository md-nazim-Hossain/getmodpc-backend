import { Request, Response } from "express";
import { ScrappingService } from "../services/scrapping.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import httpStatusCodes from "http-status-codes";
import {
  EnumLiteApkType,
  ICheckAppVersionResponse,
  ILiteApksAppsAndGames,
  IPaginationOptions,
} from "../types";
import pick from "../utils/pick";
import { paginationFields } from "../const/pagination.const";

export class ScrappingController {
  private readonly scrappingService = new ScrappingService();
  public getPlayStoreAppByUrl = catchAsync(
    async (req: Request, res: Response) => {
      const appData = await this.scrappingService.getPlayStoreAppByUrl(
        req.body.url,
      );
      sendResponse(res, {
        message: "App data fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: appData,
        success: true,
      });
    },
  );

  public getPlayStoreAppsByAppName = catchAsync(
    async (req: Request, res: Response) => {
      const { appName } = req.query;
      const paginationOptions: IPaginationOptions = pick(
        req.query,
        paginationFields,
      );
      const appData = await this.scrappingService.getPlayStoreAppsByAppName(
        appName as string,
        paginationOptions,
      );
      sendResponse(res, {
        message: "App data fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: appData.data,
        meta: appData.meta,
        success: true,
      });
    },
  );

  public checkUpdate = catchAsync(async (req: Request, res: Response) => {
    const appData = await this.scrappingService.checkUpdate(
      req.params.id,
      req.body.appId,
      req.body.currentVersion,
    );
    sendResponse<ICheckAppVersionResponse>(res, {
      message: "App data fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: appData,
      success: true,
    });
  });

  //================================== Liteapks APP =================== //
  public getLiteApkAppByUrl = catchAsync(
    async (req: Request, res: Response) => {
      const app = await this.scrappingService.getLiteApkAppByUrl(req.body.url);
      sendResponse(res, {
        message: "Liteapks Apps fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: app,
        success: true,
      });
    },
  );

  public getAllLiteApkLatestAppsAndGames = catchAsync(
    async (req: Request, res: Response) => {
      const apps = await this.scrappingService.getAllLiteApkLatestAppsAndGames(
        req.query.type as EnumLiteApkType,
        +((req.query.page as string) || 1) as number,
      );
      sendResponse<ILiteApksAppsAndGames[]>(res, {
        message: "Liteapks Apps fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: apps,
        success: true,
      });
    },
  );
}
