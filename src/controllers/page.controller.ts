import { Request, Response } from "express";
import { PageService } from "../services/page.service";
import { catchAsync } from "../utils/catchAsync";
import pick from "../utils/pick";
import { IPaginationOptions } from "../types";
import { paginationFields } from "../const/pagination.const";
import sendResponse from "../utils/ApiResponse";
import { Page } from "../models/page.model";
import { PageConstant } from "../const/page.const";

export class PageController {
  private pageService = new PageService();

  public getAllPages = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, PageConstant.pageFiltersFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const pages = await this.pageService.getAllPages(
      filters,
      paginationOptions,
    );
    sendResponse<Page[]>(res, {
      message: "Pages fetched successfully",
      statusCode: 200,
      data: pages.data,
      meta: pages.meta,
      success: true,
    });
  });

  public getPageById = catchAsync(async (req: Request, res: Response) => {
    const page = await this.pageService.getPageById(req.params.id);
    sendResponse<Page>(res, {
      message: "Page fetched successfully",
      statusCode: 200,
      data: page,
      success: true,
    });
  });

  public getPageBySlug = catchAsync(async (req: Request, res: Response) => {
    const page = await this.pageService.getPageBySlug(req.params.slug);
    sendResponse<Page>(res, {
      message: "Page fetched successfully",
      statusCode: 200,
      data: page,
      success: true,
    });
  });

  public createPage = catchAsync(async (req: Request, res: Response) => {
    const page = await this.pageService.createPage(req.body);
    sendResponse<Page>(res, {
      message: "Page created successfully",
      statusCode: 201,
      data: page,
      success: true,
    });
  });

  public updatePage = catchAsync(async (req: Request, res: Response) => {
    const page = await this.pageService.updatePage(req.params.id, req.body);
    sendResponse<Page>(res, {
      message: "Page updated successfully",
      statusCode: 200,
      data: page,
      success: true,
    });
  });

  public deletePage = catchAsync(async (req: Request, res: Response) => {
    await this.pageService.deletePage(req.params.id);
    sendResponse<Page>(res, {
      message: "Page deleted successfully",
      statusCode: 200,
      success: true,
    });
  });

  public deleteMultiplePages = catchAsync(
    async (req: Request, res: Response) => {
      await this.pageService.deleteMultiplePages(req.body.ids);
      sendResponse<void>(res, {
        message: "Pages deleted successfully",
        statusCode: 200,
        success: true,
      });
    },
  );
}
