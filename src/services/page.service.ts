import { AppDataSource } from "../config/db";
import { Page } from "../models/page.model";
import { IGenericResponse, IPageFilters, IPaginationOptions } from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import { PageConstant } from "../const/page.const";
import { generateUniqueSlug } from "../utils/generate-slug";
import { In } from "typeorm";
export class PageService {
  private pageRepository = AppDataSource.getRepository(Page);

  async getAllPages(
    filters: IPageFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Page[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.pageRepository.createQueryBuilder("page");

    // Apply search
    if (searchTerm) {
      const searchConditions = PageConstant.pageSearchFields.map(
        (field) => `page.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    if (Object.keys(filtersData).length > 0) {
      Object.entries(filtersData).forEach(([key, value]) => {
        query.andWhere(`page.${key} = :${key}`, {
          [key]: value,
        });
      });
    }

    const total = await query.getCount();
    query.orderBy(`page.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);
    const result = await query.getMany();
    const meta = calculatePaginationMeta(total, page, limit);

    return {
      meta,
      data: result,
    };
  }

  async getPageById(id: string): Promise<Page | null> {
    return await this.pageRepository.findOneBy({ id });
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const page = await this.pageRepository.findOneBy({ slug });
    if (!page) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Page not found");
    }
    if (!page.is_active) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Page is not published");
    }
    return page;
  }

  async createPage(page: Page): Promise<Page> {
    const slug = await generateUniqueSlug(page.title!, this.pageRepository);
    page.slug = slug;
    const newPage = this.pageRepository.create(page);
    return this.pageRepository.save(newPage);
  }

  async updatePage(id: string, page: Page): Promise<Page> {
    const existingPage = await this.pageRepository.findOneBy({ id });
    if (!existingPage) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Page not found");
    }
    let slug = existingPage.slug;
    if (page.title && existingPage.title !== page.title)
      slug = await generateUniqueSlug(page.title, this.pageRepository, id);
    page.slug = slug;
    page.last_edited_at = new Date();
    return this.pageRepository.save(page);
  }

  async deletePage(id: string): Promise<void> {
    await this.pageRepository.delete(id);
  }

  async deleteMultiplePages(ids: string[]): Promise<void> {
    await this.pageRepository.delete({ id: In(ids) });
  }
}
