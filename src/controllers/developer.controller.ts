import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import pick from "../utils/pick";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import httpStatusCodes from "http-status-codes";
import { DeveloperService } from "../services/developer.service";
import { TagDeveloperConstant } from "../const/tag_developer.const";
import { Developer } from "../models/developer.model";

export class DeveloperController {
  private developerService = new DeveloperService();

  public getAllDevelopers = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(
      req.query,
      TagDeveloperConstant.tagDeveloperFiltersFields,
    );
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const developers = await this.developerService.getAllDevelopers(
      filters,
      paginationOptions,
    );
    sendResponse<Developer[]>(res, {
      message: "Developers fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: developers.data,
      meta: developers.meta,
      success: true,
    });
  });

  public getDeveloperById = catchAsync(async (req: Request, res: Response) => {
    const developer = await this.developerService.getDeveloperById(
      req.params.id,
    );
    sendResponse<Developer>(res, {
      message: "Developer fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: developer,
      success: true,
    });
  });

  public getDeveloperBySlug = catchAsync(
    async (req: Request, res: Response) => {
      const developer = await this.developerService.getDeveloperBySlug(
        req.params.slug,
      );
      sendResponse<Developer>(res, {
        message: "Developer fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: developer,
        success: true,
      });
    },
  );

  public createDeveloper = catchAsync(async (req: Request, res: Response) => {
    const developer = await this.developerService.createDeveloper(req.body);
    sendResponse<Developer>(res, {
      message: "Developer created successfully",
      statusCode: httpStatusCodes.CREATED,
      data: developer,
      success: true,
    });
  });

  public updateDeveloper = catchAsync(async (req: Request, res: Response) => {
    const developer = await this.developerService.updateDeveloper(
      req.params.id,
      req.body,
    );
    sendResponse<Developer>(res, {
      message: "Developer updated successfully",
      statusCode: httpStatusCodes.OK,
      data: developer,
      success: true,
    });
  });

  public deleteDeveloper = catchAsync(async (req: Request, res: Response) => {
    const developer = await this.developerService.deleteDeveloper(
      req.params.id,
    );
    sendResponse<Developer>(res, {
      message: "Developer deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: developer,
      success: true,
    });
  });

  public deleteMultipleDevelopers = catchAsync(
    async (req: Request, res: Response) => {
      await this.developerService.deleteMultipleDevelopers(req.body.ids);
      sendResponse<void>(res, {
        message: "Developers deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );
}
