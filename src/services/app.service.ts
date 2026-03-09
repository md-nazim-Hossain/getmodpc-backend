import { DeleteResult, In, IsNull, Not, UpdateResult } from "typeorm";
import { AppDataSource } from "../config/db";
import { AppConstant } from "../const/app.const";
import { App } from "../models/app.model";
import {
  EnumAppStatus,
  IAppFilters,
  IGenericResponse,
  IPaginationOptions,
} from "../types";
import { calculatePagination } from "../utils/pagination";
import { endOfMonth, startOfMonth } from "date-fns";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import { CreateAppDTO, UpdateAppDTO } from "../dto/app.dto";
import { Category } from "../models/category.model";
import { Tag } from "../models/tag.model";
import { AppLink } from "../models/app_link.model";

export class AppService {
  private readonly appRepository = AppDataSource.getRepository(App);
  private readonly categoryRepository = AppDataSource.getRepository(Category);
  private readonly tagRepository = AppDataSource.getRepository(Tag);
  private readonly appLinkRepository = AppDataSource.getRepository(AppLink);

  async getAllApps(
    filters: IAppFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<App[]>> {
    const { category, date, searchTerm, only_deleted, ...filtersData } =
      filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.appRepository
      .createQueryBuilder("app")
      .leftJoin("app.categories", "category")
      .addSelect(["category.id", "category.name", "category.slug"]);

    if (only_deleted) {
      query
        .where("app.is_deleted = :is_deleted", { is_deleted: true })
        .andWhere("app.deleted_at IS NOT NULL");
    } else {
      query
        .where("app.is_deleted = :is_deleted", { is_deleted: false })
        .andWhere("app.deleted_at IS NULL");
    }

    if (searchTerm) {
      const searchConditions = AppConstant.appSearchableFields.map(
        (field) => `app.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    // Other simple filters
    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`app.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    if (category) {
      query.andWhere("category.id = :categoryId", { categoryId: category });
    }

    if (date) {
      const [year, month] = date.split("-").map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));
      query.andWhere("app.published_date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    const total = await query.getCount();

    query.orderBy(`app.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();
    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  }

  async getAllSliderApps(): Promise<App[]> {
    return await this.appRepository.find({
      where: {
        is_deleted: false,
        deleted_at: IsNull(),
        show_in_slider: true,
      },
      select: [
        "id",
        "name",
        "slug",
        "icon",
        "header_image",
        "os_version",
        "size",
        "is_verified",
        "short_mode",
        "version",
      ],
    });
  }

  async getAppBySlug(slug: string): Promise<App | null> {
    return await this.appRepository.findOneBy({
      slug,
      is_deleted: false,
      deleted_at: IsNull(),
    });
  }

  async getAllSearchableApps(search: string): Promise<App[]> {
    const searchText = search.trim()?.toLocaleLowerCase();

    return await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = false")
      .andWhere("app.deleted_at IS NULL")
      .andWhere(
        "(LOWER(app.name) ILIKE :search OR LOWER(app.summary) ILIKE :search OR LOWER(app.slug) ILIKE :search)",
        { search: `%${searchText}%` },
      )
      .select(["app.id", "app.name", "app.slug", "app.icon"])
      .getMany();
  }

  async createApp(input: CreateAppDTO): Promise<App> {
    const {
      categories: categoryIds,
      tags: tagIds,
      links: linkIds,
      ...rest
    } = input;

    const newApp = this.appRepository.create({
      ...rest,
      published_date: rest.status === EnumAppStatus.PUBLISH ? new Date() : null,
    });

    if (categoryIds?.length) {
      newApp.categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
    }

    if (tagIds?.length) {
      newApp.tags = await this.tagRepository.findBy({
        id: In(tagIds),
      });
    }

    if (linkIds?.length) {
      newApp.links = await this.appLinkRepository.findBy({
        id: In(linkIds),
      });
    }

    return await this.appRepository.save(newApp);
  }

  async updateApp(id: string, input: UpdateAppDTO): Promise<App> {
    const app = await this.appRepository.findOne({
      where: { id, is_deleted: false, deleted_at: IsNull() },
      relations: ["categories", "tags", "links"],
    });

    if (!app) throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");

    const {
      categories: categoryIds,
      tags: tagIds,
      links: linkIds,
      status,
      ...rest
    } = input;

    Object.assign(app, {
      ...rest,
      published_date:
        status === EnumAppStatus.PUBLISH ? new Date() : app.published_date,
    });

    if (categoryIds) {
      app.categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
    }

    if (tagIds) {
      app.tags = await this.tagRepository.findBy({
        id: In(tagIds),
      });
    }

    if (linkIds) {
      app.links = await this.appLinkRepository.findBy({
        id: In(linkIds),
      });
    }

    return await this.appRepository.save(app);
  }

  async softDeletedApps(ids: string[]): Promise<UpdateResult> {
    return await this.appRepository.update(
      { id: In(ids), is_deleted: false, deleted_at: IsNull() },
      {
        is_deleted: true,
        deleted_at: new Date(),
      },
    );
  }

  async restoreApps(ids: string[]): Promise<UpdateResult> {
    return await this.appRepository.update(
      { id: In(ids), is_deleted: true, deleted_at: Not(IsNull()) },
      {
        is_deleted: false,
        deleted_at: null,
      },
    );
  }

  async emptyTrash(ids: string[]): Promise<DeleteResult> {
    return await this.appRepository.delete({
      id: In(ids),
      is_deleted: true,
      deleted_at: Not(IsNull()),
    });
  }
}
