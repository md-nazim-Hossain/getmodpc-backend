import { AppDataSource } from "../config/db";
import { Category } from "../models/category.model";
import {
  ICategoryFilters,
  IGenericResponse,
  IPaginationOptions,
} from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import { calculatePagination } from "../utils/pagination";
import { CategoryConstant } from "../const/category.const";
import { generateUniqueSlug } from "../utils/generate-slug";
export class CategoryService {
  private categoryRepository = AppDataSource.getRepository(Category);

  async getAllCategories(
    filters: ICategoryFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Category[]>> {
    const { searchTerm, parent_id, ...filtersData } = filters;

    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.categoryRepository
      .createQueryBuilder("category")
      .leftJoinAndSelect("category.parent", "parent");

    if (searchTerm) {
      const searchConditions = CategoryConstant.categorySearchFields.map(
        (field) => `category.${field} ILIKE :search`,
      );

      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    if (parent_id !== undefined) {
      if (parent_id === null) {
        query.andWhere("category.parent_cat_id IS NULL");
      } else {
        query.andWhere("category.parent_cat_id = :parent_id", {
          parent_id,
        });
      }
    }

    Object.entries(filtersData).forEach(([key, value]) => {
      query.andWhere(`category.${key} = :${key}`, {
        [key]: value,
      });
    });

    const totalQuery = query.clone();

    query
      .orderBy(`category.${sort_by}`, sort_order as "ASC" | "DESC")
      .skip(skip)
      .take(limit);

    const [data, total] = await Promise.all([
      query.getMany(),
      totalQuery.getCount(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await this.categoryRepository.findOneBy({ id });
  }

  async createCategory(categoryData: Category): Promise<Category> {
    const slug = await generateUniqueSlug(
      categoryData.name!,
      this.categoryRepository,
    );

    let parent: Category | null = null;

    if (categoryData.parent) {
      parent = await this.categoryRepository.findOneBy({
        id: categoryData.parent.id,
      });

      if (!parent) {
        throw new ApiError(
          httpStatusCodes.BAD_REQUEST,
          "Invalid parent category",
        );
      }
    }

    const newCategory = this.categoryRepository.create({
      ...categoryData,
      slug,
      parent,
    });

    return await this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    id: string,
    categoryData: Partial<Category>,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent"],
    });

    if (!category) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Category not found");
    }

    if (categoryData.name && categoryData.name !== category.name) {
      category.slug = await generateUniqueSlug(
        categoryData.name,
        this.categoryRepository,
        id,
      );
    }

    if (categoryData.parent) {
      const parent = await this.categoryRepository.findOneBy({
        id: categoryData.parent.id,
      });

      if (!parent) {
        throw new ApiError(
          httpStatusCodes.BAD_REQUEST,
          "Invalid parent category",
        );
      }

      category.parent = parent;
    }

    Object.assign(category, categoryData);

    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Category not found");
    }
    return await this.categoryRepository.remove(category);
  }
}
