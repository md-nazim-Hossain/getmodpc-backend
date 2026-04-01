import { Request, Response } from "express";
import { AdService } from "../services/ad.service";
import { catchAsync } from "../utils/catchAsync";
import { AdConstant } from "../const/ad.const";
import pick from "../utils/pick";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { Ad } from "../models/ad.model";
import httpStatusCodes from "http-status-codes";

export class AdController {
  private readonly adService = new AdService();

  public getAllAds = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, AdConstant.filterAdFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const ads = await this.adService.getAllAds(filters, paginationOptions);
    sendResponse<Ad[]>(res, {
      message: "Ads fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: ads.data,
      meta: ads.meta,
      success: true,
    });
  });

  public getAdById = catchAsync(async (req: Request, res: Response) => {
    const ad = await this.adService.getAdById(req.params.id);
    sendResponse<Ad>(res, {
      message: "Ad fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: ad,
      success: true,
    });
  });

  public getAllActiveAds = catchAsync(async (req: Request, res: Response) => {
    const ads = await this.adService.getAllActiveAds();
    sendResponse<Ad[]>(res, {
      message: "Ads fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: ads,
      success: true,
    });
  });

  public createAd = catchAsync(async (req: Request, res: Response) => {
    const ad = await this.adService.createAd(req.body);
    sendResponse<Ad>(res, {
      message: "Ad created successfully",
      statusCode: httpStatusCodes.OK,
      data: ad,
      success: true,
    });
  });

  public updateAd = catchAsync(async (req: Request, res: Response) => {
    const ad = await this.adService.updateAd(req.params.id, req.body);
    sendResponse<Ad>(res, {
      message: "Ad updated successfully",
      statusCode: httpStatusCodes.OK,
      data: ad,
      success: true,
    });
  });

  public deleteAd = catchAsync(async (req: Request, res: Response) => {
    const ad = await this.adService.deleteAd(req.params.id);
    sendResponse<Ad>(res, {
      message: "Ad deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: ad,
      success: true,
    });
  });

  public deleteMultipleAds = catchAsync(async (req: Request, res: Response) => {
    const { ids } = req.body;
    await this.adService.deleteMultipleAds(ids);
    sendResponse<void>(res, {
      message: "Ads deleted successfully",
      statusCode: httpStatusCodes.OK,
      success: true,
    });
  });
}
