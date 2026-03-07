import { Request, Response } from "express";
import { SettingService } from "../services/setting.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import { Setting } from "../models/setting.model";
import httpStatusCodes from "http-status-codes";

export class SettingController {
  private readonly settingService = new SettingService();

  public upsertSetting = catchAsync(async (req: Request, res: Response) => {
    const { key, value } = req.body;
    await this.settingService.upsertSetting(key, value);
    sendResponse<void>(res, {
      message: "Setting updated successfully",
      statusCode: httpStatusCodes.OK,
      success: true,
    });
  });

  public getSetting = catchAsync(async (req: Request, res: Response) => {
    const setting = await this.settingService.getSetting(req.params.key);
    sendResponse<Setting>(res, {
      message: "Setting fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: setting,
      success: true,
    });
  });

  public getAllSettings = catchAsync(async (req: Request, res: Response) => {
    const settings = await this.settingService.getAllSettings();
    sendResponse<Setting[]>(res, {
      message: "Settings fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: settings,
      success: true,
    });
  });

  public deleteSetting = catchAsync(async (req: Request, res: Response) => {
    await this.settingService.deleteSetting(req.params.key);
    sendResponse<void>(res, {
      message: "Setting deleted successfully",
      statusCode: httpStatusCodes.OK,
      success: true,
    });
  });
}
