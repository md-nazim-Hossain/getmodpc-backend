import { DeleteResult, In, IsNull, Not, UpdateResult, Between } from "typeorm";
import { AppDataSource } from "../config/db";
import { AppConstant } from "../const/app.const";
import { App } from "../models/app.model";
import {
  EnumAppSource,
  EnumAppStatus,
  EnumAppType,
  EnumPlatformType,
  IAppDownloadPageResponseDTO,
  IAppFilters,
  IAppResponseDTO,
  IGenericResponse,
  IHomePageApp,
  IHomePageAppResponse,
  IPaginationOptions,
} from "../types";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
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
import { FaqService } from "./faq.service";
import { Report } from "../models/report";
import { Ad } from "../models/ad.model";

export class AppService {
  private readonly appRepository = AppDataSource.getRepository(App);
  private readonly categoryRepository = AppDataSource.getRepository(Category);
  private readonly tagRepository = AppDataSource.getRepository(Tag);
  private readonly appLinkRepository = AppDataSource.getRepository(AppLink);
  private readonly ratingRepository = AppDataSource.getRepository(Rating);
  private readonly reportRepository = AppDataSource.getRepository(Report);
  private readonly adRepository = AppDataSource.getRepository(Ad);
  private readonly categoryService = new CategoryService();
  private readonly faqService = new FaqService();

  private readonly select: any = [
    "app.id",
    "app.name",
    "app.slug",
    "app.icon",
    "app.header_image",
    "app.os_version",
    "app.size",
    "app.is_verified",
    "app.short_mode",
    "app.version",
    "app.platform",
    "app.type",
    "app.updated_at",
  ];

  private readonly baseWhere = `
    app.is_deleted = false
    AND app.deleted_at IS NULL
    AND app.status = :status
  `;

  private async getAppsByType(
    type: EnumAppType,
    orderBy: keyof App,
    take = 8,
  ): Promise<IHomePageApp[]> {
    return this.appRepository.find({
      where: {
        is_deleted: false,
        deleted_at: IsNull(),
        status: EnumAppStatus.PUBLISH,
        type,
      },
      select: this.select.map((s) => s.split(".")[1]),
      take,
      order: { [orderBy]: "DESC" },
    });
  }

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
    const meta = calculatePaginationMeta(total, page, limit);

    return {
      meta,
      data,
    };
  }

  async getAllSliderApps(): Promise<IHomePageApp[]> {
    return await this.appRepository
      .createQueryBuilder("app")
      .where(this.baseWhere, { status: EnumAppStatus.PUBLISH })
      .andWhere("app.show_in_slider = true")
      .select(this.select)
      .orderBy("app.updated_at", "DESC")
      .getMany();
  }

  async getAllHomePageApps(): Promise<IHomePageAppResponse> {
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
      this.getAppsByType(EnumAppType.APP, "installs"),
      this.getAppsByType(EnumAppType.GAME, "installs"),
      this.getAppsByType(EnumAppType.APP, "updated_at"),
      this.getAppsByType(EnumAppType.GAME, "updated_at"),
      this.getAppsByType(EnumAppType.APP, "created_at"),
      this.getAppsByType(EnumAppType.GAME, "created_at"),
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
      .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
      .getOne();

    if (!app) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");
    }

    const categoryIds = app.categories?.map((c) => c.id) || [];
    const tagIds = app.tags?.map((t) => t.id) || [];
    const developers = app.app_developers || [];

    // -------------------------------
    // 1. CATEGORY APPS
    // -------------------------------
    const categoryApps = categoryIds.length
      ? await this.appRepository
          .createQueryBuilder("app")
          .leftJoin("app.categories", "category")
          .where("category.id IN (:...categoryIds)", { categoryIds })
          .andWhere("app.id != :appId", { appId: app.id })
          .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
          .select(this.select)
          .distinct(true)
          .orderBy("app.updated_at", "DESC")
          .take(20)
          .getMany()
      : [];

    // -------------------------------
    // 2. TAG BASED SIMILAR APPS
    // -------------------------------
    const similarApps = tagIds.length
      ? await this.appRepository
          .createQueryBuilder("app")
          .leftJoin("app.tags", "tag")
          .where("tag.id IN (:...tagIds)", { tagIds })
          .andWhere("app.id != :appId", { appId: app.id })
          .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
          .select(this.select)
          .distinct(true)
          .orderBy("app.updated_at", "DESC")
          .take(20)
          .getMany()
      : [];

    // -------------------------------
    // 3. SAME DEVELOPER (string[] overlap)
    // -------------------------------
    const developerApps = developers.length
      ? await this.appRepository
          .createQueryBuilder("app")
          .where("app.id != :appId", { appId: app.id })
          .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
          .andWhere("app.app_developers && ARRAY[:...developers]", {
            developers,
          })

          .select(this.select)
          .orderBy("app.updated_at", "DESC")
          .take(20)
          .getMany()
      : [];

    const usedIds = new Set([
      ...categoryApps.map((a) => a.id),
      ...similarApps.map((a) => a.id),
    ]);

    const filteredDeveloperApps = developerApps.filter(
      (a) => !usedIds.has(a.id),
    );

    const response = {
      ...app,
      links: app.links?.map(({ app, ...rest }) => rest),

      related: {
        byCategory: categoryApps,
        similar: similarApps,
        sameDeveloper: filteredDeveloperApps,
      },
    };

    return response;
  }

  async getDownloadPageAppBySlug(
    slug: string,
  ): Promise<IAppDownloadPageResponseDTO> {
    const app = await this.appRepository
      .createQueryBuilder("app")
      .leftJoin("app.categories", "category")
      .addSelect(["category.id", "category.name", "category.slug"])
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
      .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
      .select([
        "app.id",
        "app.name",
        "app.slug",
        "app.is_verified",
        "app.icon",
        "app.created_at",
        "app.updated_at",
        "app.platform",
        "app.modders",
        "link.id",
        "link.name",
        "link.type",
        "link.size",
        "link.link",
        "link.note",
      ])
      .getOne();

    if (!app) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "App not found");
    }
    const categoryIds = app.categories?.map((c) => c.id) || [];

    const categoryApps = categoryIds.length
      ? await this.appRepository
          .createQueryBuilder("app")
          .leftJoin("app.categories", "category")
          .where("category.id IN (:...categoryIds)", { categoryIds })
          .andWhere("app.id != :appId", { appId: app.id })
          .andWhere(this.baseWhere, { status: EnumAppStatus.PUBLISH })
          .select(this.select)
          .distinct(true)
          .orderBy("app.updated_at", "DESC")
          .take(20)
          .getMany()
      : [];

    const faqs = app.platform
      ? await this.faqService.getFaqByPlatform(app.platform as EnumPlatformType)
      : [];

    return {
      ...app,
      links: app.links?.map(({ app, ...rest }) => rest),

      related: {
        byCategory: categoryApps,
        downloadFaqs: faqs,
      },
    };
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

  async getAllUpdatedApps(
    pagination: IPaginationOptions,
  ): Promise<IGenericResponse<App[]>> {
    const { limit, skip, page } = calculatePagination(pagination);

    const query = this.appRepository
      .createQueryBuilder("app")
      .where("app.source = :source", { source: EnumAppSource.PLAY_STORE })
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere("app.is_deleted = false")
      .andWhere("app.deleted_at IS NULL")
      .andWhere("app.version IS NOT NULL AND app.version != ''")
      .andWhere("app.latest_version IS NOT NULL AND app.latest_version != ''")
      .andWhere("app.latest_version <> app.version")
      .orderBy("app.last_version_checked_at", "DESC")
      .select([
        "app.id",
        "app.name",
        "app.slug",
        "app.icon",
        "app.version",
        "app.latest_version",
      ])
      .skip(skip)
      .take(limit);

    const [apps, count] = await query.getManyAndCount();

    return {
      data: apps,
      meta: calculatePaginationMeta(count, page, limit),
    };
  }

  async getCountOfUpdatedApps(): Promise<number> {
    return this.appRepository
      .createQueryBuilder("app")
      .where("app.source = :source", { source: EnumAppSource.PLAY_STORE })
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere("app.is_deleted = false")
      .andWhere("app.deleted_at IS NULL")
      .andWhere("app.version IS NOT NULL AND app.version != ''")
      .andWhere("app.latest_version IS NOT NULL AND app.latest_version != ''")
      .andWhere("app.latest_version <> app.version")
      .getCount();
  }

  async getAllSoftDeletedApps(
    pagination: IPaginationOptions,
  ): Promise<IGenericResponse<App[]>> {
    const { limit, skip, page } = calculatePagination(pagination);

    const query = this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = true")
      .andWhere("app.deleted_at IS NOT NULL")
      .orderBy("app.deleted_at", "DESC")
      .select(["app.id", "app.name", "app.slug", "app.icon"])
      .skip(skip)
      .take(limit);

    const [apps, count] = await query.getManyAndCount();

    return {
      data: apps,
      meta: calculatePaginationMeta(count, page, limit),
    };
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

  async getDashboardData(filters: { startDate?: Date; endDate?: Date }) {
    const { startDate, endDate } = filters;

    const dateCondition =
      startDate && endDate ? { created_at: Between(startDate, endDate) } : {};

    // Total Apps
    const totalApps = await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = false")
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere("app.type = :type", { type: EnumAppType.APP })
      .andWhere(
        startDate && endDate
          ? "app.created_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
        },
      )
      .getCount();

    // Total Games
    const totalGames = await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = false")
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere("app.type = :type", { type: EnumAppType.GAME })
      .andWhere(
        startDate && endDate
          ? "app.created_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
        },
      )
      .getCount();

    // Total Reports
    const totalReports = await this.reportRepository
      .createQueryBuilder("report")
      .where(
        startDate && endDate
          ? "report.created_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
        },
      )
      .getCount();

    // Total Running Ads
    const currentDate = new Date();
    const totalRunningAds = await this.adRepository
      .createQueryBuilder("ad")
      .where("ad.is_active = true")
      .andWhere("ad.start_at <= :currentDate")
      .andWhere("ad.end_at >= :currentDate")
      .andWhere(
        startDate && endDate
          ? "ad.created_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
          currentDate,
        },
      )
      .getCount();

    // Total Updated Apps (where latest_version != version)
    const totalUpdatedApps = await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = false")
      .andWhere("app.status = :status", { status: EnumAppStatus.PUBLISH })
      .andWhere("app.source = :source", { source: EnumAppSource.PLAY_STORE })
      .andWhere("app.version IS NOT NULL")
      .andWhere("app.latest_version IS NOT NULL")
      .andWhere("app.latest_version != app.version")
      .andWhere(
        startDate && endDate
          ? "app.created_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
        },
      )
      .getCount();

    // Total Deleted Apps
    const totalDeletedApps = await this.appRepository
      .createQueryBuilder("app")
      .where("app.is_deleted = true")
      .andWhere("app.deleted_at IS NOT NULL")
      .andWhere(
        startDate && endDate
          ? "app.deleted_at BETWEEN :startDate AND :endDate"
          : "1=1",
        {
          startDate,
          endDate,
        },
      )
      .getCount();

    return {
      totalApps,
      totalGames,
      totalReports,
      totalRunningAds,
      totalUpdatedApps,
      totalDeletedApps,
    };
  }
}
