import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import { Category } from "../models/category.model";
import { CategoryService } from "../services/category.service";
import { paginationFields } from "../const/pagination.const";
import pick from "../utils/pick";
import { CategoryConstant } from "../const/category.const";
import { IGroupedCategory, IPaginationOptions } from "../types";

export class CategoryController {
  private categoryService = new CategoryService();
  public getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, CategoryConstant.categoryFiltersFields);
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const categories = await this.categoryService.getAllCategories(
      filters,
      paginationOptions,
    );
    sendResponse<Category[]>(res, {
      message: "Categories fetched successfully",
      statusCode: 200,
      data: categories.data,
      meta: categories.meta,
      success: true,
    });
  });

  public getGroupedCategories = catchAsync(
    async (req: Request, res: Response) => {
      const categories = await this.categoryService.getGroupedCategories();
      sendResponse<IGroupedCategory[]>(res, {
        message: "Categories fetched successfully",
        statusCode: 200,
        data: categories,
        success: true,
      });
    },
  );

  public getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.getCategoryById(req.params.id);
    sendResponse<Category>(res, {
      message: "Category fetched successfully",
      statusCode: 200,
      data: category,
      success: true,
    });
  });

  public createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    sendResponse<Category>(res, {
      message: "Category created successfully",
      statusCode: 201,
      data: category,
      success: true,
    });
  });

  public updateCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.updateCategory(
      req.params.id,
      req.body,
    );
    sendResponse<Category>(res, {
      message: "Category updated successfully",
      statusCode: 200,
      data: category,
      success: true,
    });
  });

  public deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await this.categoryService.deleteCategory(req.params.id);
    sendResponse<Category>(res, {
      message: "Category deleted successfully",
      statusCode: 200,
      data: category,
      success: true,
    });
  });

  public deleteMultipleCategories = catchAsync(
    async (req: Request, res: Response) => {
      await this.categoryService.deleteMultipleCategories(req.body.ids);
      sendResponse<void>(res, {
        message: "Categories deleted successfully",
        statusCode: 200,
        success: true,
      });
    },
  );
}
