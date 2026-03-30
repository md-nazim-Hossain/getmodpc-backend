import { AppDataSource } from "../config/db";
import { Ad } from "../models/ad.model";
import { IAdFilters, IGenericResponse, IPaginationOptions } from "../types";
import httpStatusCode from "http-status-codes";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import { AdConstant } from "../const/ad.const";
import ApiError from "../utils/ApiError";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export class AdService {
  private readonly adRepository = AppDataSource.getRepository(Ad);

  async getAllAds(
    filters: IAdFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Ad[]>> {
    const { searchTerm, start_date, end_date, ...filtersData } = filters;
    const { limit, page, sort_by, sort_order, skip } =
      calculatePagination(paginationOptions);
    const query = this.adRepository.createQueryBuilder("ad");
    if (searchTerm) {
      const searchConditions = AdConstant.searchAdFields.map(
        (field) => `ad.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    if (start_date && end_date) {
      query.andWhere(`ad.start_at >= :start_date AND ad.end_at <= :end_date`, {
        start_date,
        end_date,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`ad.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`ad.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();
    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async getAllActiveAds(): Promise<Ad[]> {
    const now = new Date();

    const ads = await this.adRepository.find({
      where: {
        is_active: true,
        start_at: LessThanOrEqual(now),
        end_at: MoreThanOrEqual(now),
      },
    });

    return ads;
  }

  async getAdById(id: string) {
    const ad = await this.adRepository.findOneBy({ id });
    if (!ad) {
      throw new ApiError(httpStatusCode.NOT_FOUND, "Ad not found");
    }
    return ad;
  }

  async createAd(ad: Ad) {
    const newAd = this.adRepository.create(ad);
    return await this.adRepository.save(newAd);
  }

  async updateAd(id: string, ad: Partial<Ad>) {
    const update = await this.adRepository.findOneBy({ id });
    if (!update) {
      throw new ApiError(httpStatusCode.NOT_FOUND, "Ad not found");
    }
    Object.assign(update, ad);
    return await this.adRepository.save(update);
  }

  async deleteAd(id: string) {
    const ad = await this.adRepository.findOneBy({ id });
    if (!ad) {
      throw new ApiError(httpStatusCode.NOT_FOUND, "Ad not found");
    }
    return await this.adRepository.remove(ad);
  }
}
