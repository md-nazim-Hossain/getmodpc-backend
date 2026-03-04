import { Request, Response } from "express";
import { UserAppRequestService } from "../services/user_app_request.service";
import { catchAsync } from "../utils/catchAsync";
import { UserAppRequestConstant } from "../const/user_app_request.const";
import { paginationFields } from "../const/pagination.const";
import { IPaginationOptions } from "../types";
import pick from "../utils/pick";
import sendResponse from "../utils/ApiResponse";
import { UserAppRequest } from "../models/user_app_request.model";
import httpStatusCodes from "http-status-codes";

export class UserAppRequestController {
  private readonly userAppRequestService = new UserAppRequestService();

  public getAllUserAppRequests = catchAsync(
    async (req: Request, res: Response) => {
      const filters = pick(
        req.query,
        UserAppRequestConstant.userAppRequestFiltersFields,
      );
      const paginationOptions: IPaginationOptions = pick(
        req.query,
        paginationFields,
      );
      const userAppRequests =
        await this.userAppRequestService.getAllUserAppRequests(
          filters,
          paginationOptions,
        );
      sendResponse<UserAppRequest[]>(res, {
        message: "UserAppRequests fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: userAppRequests.data,
        meta: userAppRequests.meta,
        success: true,
      });
    },
  );

  public getUserAppRequestById = catchAsync(
    async (req: Request, res: Response) => {
      const userAppRequest =
        await this.userAppRequestService.getUserAppRequestById(req.params.id);
      sendResponse<UserAppRequest>(res, {
        message: "UserAppRequest fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: userAppRequest,
        success: true,
      });
    },
  );

  public createUserAppRequest = catchAsync(
    async (req: Request, res: Response) => {
      const userAppRequest =
        await this.userAppRequestService.createUserAppRequest(req.body);
      sendResponse<UserAppRequest>(res, {
        message: "UserAppRequest created successfully",
        statusCode: httpStatusCodes.OK,
        data: userAppRequest,
        success: true,
      });
    },
  );

  public updateUserAppRequest = catchAsync(
    async (req: Request, res: Response) => {
      const userAppRequest =
        await this.userAppRequestService.updateUserAppRequest(
          req.params.id,
          req.body,
        );
      sendResponse<UserAppRequest>(res, {
        message: "UserAppRequest updated successfully",
        statusCode: httpStatusCodes.OK,
        data: userAppRequest,
        success: true,
      });
    },
  );

  public deleteUserAppRequest = catchAsync(
    async (req: Request, res: Response) => {
      await this.userAppRequestService.deleteUserAppRequest(req.params.id);
      sendResponse<UserAppRequest>(res, {
        message: "UserAppRequest deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );
}
