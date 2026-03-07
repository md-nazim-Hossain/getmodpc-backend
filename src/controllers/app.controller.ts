import { Request, Response } from "express";
import { AppService } from "../services/app.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import httpStatusCodes from "http-status-codes";

export class AppController {
  private readonly appService = new AppService();
  public getAppDataByUrl = catchAsync(async (req: Request, res: Response) => {
    const appData = await this.appService.getAppDataByUrl(req.body.url);
    sendResponse(res, {
      message: "App data fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: appData,
      success: true,
    });
  });
}
