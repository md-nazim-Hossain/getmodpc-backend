import { In, Repository } from "typeorm";
import { Testimonial } from "../models/testimonial.model";
import httpStatusCodes from "http-status-codes";
import ApiError from "../utils/ApiError";
import {
  IGenericResponse,
  IPaginationOptions,
  ITestimonialFilters,
} from "../types";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import { TestimonialConstant } from "../const/testimonial.const";
import { AppDataSource } from "../config/db";

export class TestimonialService {
  private readonly testimonialRepository =
    AppDataSource.getRepository(Testimonial);
  async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    if (data.sort_order === undefined || data.sort_order === null) {
      const maxSortOrder = await this.testimonialRepository.find({
        order: { sort_order: "DESC" },
        take: 1,
      });
      const maxSortOrderEntity = maxSortOrder[0];

      if (
        maxSortOrderEntity &&
        typeof maxSortOrderEntity.sort_order === "number"
      ) {
        data.sort_order = maxSortOrderEntity.sort_order + 1;
      } else {
        data.sort_order = 1;
      }
    }
    const testimonial = this.testimonialRepository.create(data);
    return await this.testimonialRepository.save(testimonial);
  }

  async updateTestimonial(
    id: string,
    data: Partial<Testimonial>,
  ): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOneBy({ id });

    if (!testimonial) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Testimonial not found");
    }

    Object.assign(testimonial, data);
    return await this.testimonialRepository.save(testimonial);
  }

  async getAllTestimonials(
    filters: ITestimonialFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Testimonial[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.testimonialRepository.createQueryBuilder("testimonial");

    if (searchTerm) {
      const searchConditions = TestimonialConstant.testimonialSearchFields.map(
        (field) => `testimonial.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`testimonial.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`testimonial.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async getAllActiveTestimonials(): Promise<Testimonial[]> {
    const testimonials = await this.testimonialRepository.find({
      where: { is_active: true },
    });
    return testimonials;
  }

  async getTestimonialById(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOneBy({ id });
    if (!testimonial) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Testimonial not found");
    }
    return testimonial;
  }

  async deleteTestimonial(id: string): Promise<void> {
    const testimonial = await this.testimonialRepository.findOneBy({ id });
    if (!testimonial) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Testimonial not found");
    }
    await this.testimonialRepository.remove(testimonial);
  }

  async deleteMultipleTestimonials(ids: string[]): Promise<void> {
    await this.testimonialRepository.delete({ id: In(ids) });
  }
}
