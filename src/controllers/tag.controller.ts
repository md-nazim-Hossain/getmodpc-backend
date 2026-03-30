import { Request, Response } from "express";
import { TagService } from "../services/tag.service";
import { catchAsync } from "../utils/catchAsync";
import pick from "../utils/pick";
import { TagDeveloperConstant } from "../const/tag_developer.const";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { Tag } from "../models/tag.model";
import httpStatusCodes from "http-status-codes";

export class TagController {
  private tagService = new TagService();

  public getAllTags = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(
      req.query,
      TagDeveloperConstant.tagDeveloperFiltersFields,
    );
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const tags = await this.tagService.getAllTags(filters, paginationOptions);
    sendResponse<Tag[]>(res, {
      message: "Tags fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: tags.data,
      meta: tags.meta,
      success: true,
    });
  });

  public getTagById = catchAsync(async (req: Request, res: Response) => {
    const tag = await this.tagService.getTagById(req.params.id);
    sendResponse<Tag>(res, {
      message: "Tag fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: tag,
      success: true,
    });
  });

  public getTagBySlug = catchAsync(async (req: Request, res: Response) => {
    const tag = await this.tagService.getTagBySlug(req.params.slug);
    sendResponse<Tag>(res, {
      message: "Tag fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: tag,
      success: true,
    });
  });

  public createTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await this.tagService.createTag(req.body);
    sendResponse<Tag>(res, {
      message: "Tag created successfully",
      statusCode: httpStatusCodes.CREATED,
      data: tag,
      success: true,
    });
  });

  public updateTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await this.tagService.updateTag(req.params.id, req.body);
    sendResponse<Tag>(res, {
      message: "Tag updated successfully",
      statusCode: httpStatusCodes.OK,
      data: tag,
      success: true,
    });
  });

  public deleteTag = catchAsync(async (req: Request, res: Response) => {
    const tag = await this.tagService.deleteTag(req.params.id);
    sendResponse<Tag>(res, {
      message: "Tag deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: tag,
      success: true,
    });
  });

  public deleteMultipleTags = catchAsync(
    async (req: Request, res: Response) => {
      await this.tagService.deleteMultipleTags(req.body.ids);
      sendResponse(res, {
        message: "Tags deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );
}
