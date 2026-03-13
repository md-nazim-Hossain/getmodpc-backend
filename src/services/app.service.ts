import { DeleteResult, In, IsNull, Not, UpdateResult } from "typeorm";
import { AppDataSource } from "../config/db";
import { AppConstant } from "../const/app.const";
import { App } from "../models/app.model";
import {
  EnumAppStatus,
  EnumAppType,
  IAppFilters,
  IAppResponseDTO,
  IGenericResponse,
  IHomePageApp,
  IHomePageAppResponse,
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
import { generateUniqueSlug } from "../utils/generate-slug";
import { Rating } from "../models/rating.model";
import { getSettingByKey } from "../utils/caches";
import { CategoryService } from "./category.service";

export class AppService {
  private readonly appRepository = AppDataSource.getRepository(App);
  private readonly categoryRepository = AppDataSource.getRepository(Category);
  private readonly tagRepository = AppDataSource.getRepository(Tag);
  private readonly appLinkRepository = AppDataSource.getRepository(AppLink);
  private readonly ratingRepository = AppDataSource.getRepository(Rating);
  private readonly categoryService = new CategoryService();

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
      .addSelect(["category.id", "category.name", "category.slug"])
      .leftJoin("app.tags", "tag")
      .addSelect(["tag.id", "tag.name", "tag.slug"])
      .leftJoin("app.links", "app_link")
      .addSelect([
        "app_link.id",
        "app_link.name",
        "app_link.type",
        "app_link.size",
        "app_link.link",
        "app_link.note",
      ]);

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

    query.orderBy(`app.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();
    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  }

  async getAllSliderApps(): Promise<IHomePageApp[]> {
    return await this.appRepository.find({
      where: {
        is_deleted: false,
        deleted_at: IsNull(),
        show_in_slider: true,
        status: EnumAppStatus.PUBLISH,
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
        "platform",
        "type",
      ],
    });
  }

  async getAllHomePageApps(): Promise<IHomePageAppResponse> {
    const select: any = [
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
      "platform",
      "type",
    ];
    const where = {
      is_deleted: false,
      deleted_at: IsNull(),
      status: EnumAppStatus.PUBLISH,
    };
    const take = 8;
    const [
      sliderApps,
      popularApps,
      popularGames,
      latestUpdatedApps,
      latestUpdatedGames,
      newReleasedApps,
      newReleasedGames,
      categories,
    ] = await Promise.all([
      this.getAllSliderApps(),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.APP },
        select,
        take,
        order: { installs: "DESC" },
      }),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.GAME },
        select,
        take,
        order: { installs: "DESC" },
      }),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.APP },
        select,
        take,
        order: { updated_at: "DESC" },
      }),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.GAME },
        select,
        take,
        order: { updated_at: "DESC" },
      }),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.APP },
        select,
        take,
        order: { created_at: "DESC" },
      }),
      this.appRepository.find({
        where: { ...where, type: EnumAppType.GAME },
        select,
        take,
        order: { created_at: "DESC" },
      }),
      this.categoryService.getGroupedCategories(),
    ]);

    return {
      sliderApps,
      popularApps,
      popularGames,
      latestUpdatedApps,
      latestUpdatedGames,
      newReleasedApps,
      newReleasedGames,
      categories,
    };
  }

  async getAppById(id: string): Promise<IAppResponseDTO> {
    const app = await this.appRepository
      .createQueryBuilder("app")
      .leftJoinAndSelect("app.categories", "category")
      .leftJoinAndSelect("app.tags", "tag")
      .leftJoinAndSelect("app.links", "link")
      .where("app.id = :id", { id })
      .getOne();

    if (!app) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");
    }

    const response = {
      ...app,
      links: app.links?.map(({ app, ...rest }) => rest),
    };
    return response;
  }

  async getAppBySlug(slug: string): Promise<IAppResponseDTO> {
    const app = await this.appRepository
      .createQueryBuilder("app")
      .leftJoin("app.categories", "category")
      .addSelect(["category.id", "category.name", "category.slug"])
      .leftJoin("app.tags", "tag")
      .addSelect(["tag.id", "tag.name", "tag.slug"])
      .leftJoin("app.links", "link")
      .addSelect([
        "link.id",
        "link.name",
        "link.type",
        "link.size",
        "link.link",
        "link.note",
      ])
      .where("app.slug = :slug", { slug })
      .andWhere("app.is_deleted = false")
      .andWhere("app.deleted_at IS NULL")
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .getOne();

    if (!app) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");
    }

    const response = {
      ...app,
      links: app.links?.map(({ app, ...rest }) => rest),
    };

    return response;
  }

  async getAllSearchableApps(search: string): Promise<App[]> {
    const searchText = search.trim()?.toLocaleLowerCase();

    return await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = false")
      .andWhere("app.deleted_at IS NULL")
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere(
        "(LOWER(app.name) ILIKE :search OR LOWER(app.summary) ILIKE :search OR LOWER(app.slug) ILIKE :search)",
        { search: `%${searchText}%` },
      )
      .select(["app.id", "app.name", "app.slug", "app.icon"])
      .getMany();
  }

  async createApp(
    input: CreateAppDTO,
  ): Promise<Pick<App, "id" | "name" | "slug">> {
    const {
      categories: categoryIds,
      tags: tagIds,
      links: linksArray,
      ...rest
    } = input;

    const newApp = this.appRepository.create({
      ...rest,
      slug: await generateUniqueSlug(rest.name, this.appRepository),
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

    const savedApp = await this.appRepository.save(newApp);
    if (linksArray?.length) {
      const links = linksArray.map((link) =>
        this.appLinkRepository.create({
          ...link,
          app: newApp,
        }),
      );
      await this.appLinkRepository.save(links);
    }
    return {
      id: savedApp.id,
      name: savedApp.name,
      slug: savedApp.slug,
    };
  }

  async updateApp(
    id: string,
    input: UpdateAppDTO,
  ): Promise<Pick<App, "id" | "name" | "slug">> {
    const app = await this.appRepository.findOne({
      where: { id, is_deleted: false, deleted_at: IsNull() },
      relations: ["categories", "tags", "links"],
    });

    if (!app) throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");

    const {
      categories: categoryIds,
      tags: tagIds,
      links: updatedLinksObject,
      status,
      ...rest
    } = input;

    if (rest.name && rest.name !== app.name) {
      rest.slug = await generateUniqueSlug(rest.name, this.appRepository);
    }

    Object.assign(app, {
      ...rest,
      status: status ?? app.status,
      published_date:
        status === EnumAppStatus.PUBLISH && !app.published_date
          ? new Date()
          : app.published_date,
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

    if (updatedLinksObject) {
      const newLinks: AppLink[] = [];

      for (const link of updatedLinksObject) {
        if (link.id) {
          const existingLink = app.links.find((l) => l.id === link.id);
          if (existingLink) {
            Object.assign(existingLink, link);
            newLinks.push(existingLink);
          }
        } else {
          const newLink = this.appLinkRepository.create({
            ...link,
            app,
          });

          newLinks.push(newLink);
        }
      }

      app.links = await this.appLinkRepository.save(newLinks);
    }

    const updatedApp = await this.appRepository.save(app);
    return {
      id: updatedApp.id,
      name: updatedApp.name,
      slug: updatedApp.slug,
    };
  }

  async givenAppRating(appId: string, ip: string): Promise<boolean> {
    const lastRating = await this.ratingRepository
      .createQueryBuilder("rating")
      .where("rating.ip = :ip", { ip })
      .andWhere("rating.appId = :appId", { appId })
      .orderBy("rating.rating_at", "DESC")
      .take(1)
      .getOne();

    if (lastRating) {
      const diff = Date.now() - new Date(lastRating.rating_at).getTime();
      const hours = diff / (1000 * 60 * 60);

      const ratingActivation = await getSettingByKey("rating");

      if (hours < 24 && ratingActivation && ratingActivation?.is_active) {
        throw new ApiError(
          httpStatusCodes.BAD_REQUEST,
          "You can rate once every 24 hours",
        );
      }
    }

    const rating = this.ratingRepository.create({
      ip,
      rating_at: new Date(),
      app: { id: appId },
    });

    await this.ratingRepository.save(rating);

    await this.appRepository.increment({ id: appId }, "ratings", 1);

    return true;
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
