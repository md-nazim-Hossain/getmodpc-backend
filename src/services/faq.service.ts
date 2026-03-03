import { AppDataSource } from "../config/db";
import { FAQsConstant } from "../const/faq.const";
import { FAQs } from "../models/faq.model";
import { IFAQsFilters, IGenericResponse, IPaginationOptions } from "../types";
import ApiError from "../utils/ApiError";
import { calculatePagination } from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class FaqService {
  private readonly faqRepository = AppDataSource.getRepository(FAQs);

  async getAllFAQs(
    filters: IFAQsFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<FAQs[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.faqRepository.createQueryBuilder("faq");

    if (searchTerm) {
      const searchConditions = FAQsConstant.faqSearchFields.map(
        (field) => `faq.${field} ILIKE :search`,
      );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`faq.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`faq.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();

    return {
      data,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async getFaqById(id: string): Promise<FAQs> {
    const faq = await this.faqRepository.findOneBy({ id });
    if (!faq) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Faq not found");
    }
    return faq;
  }

  async createFaq(faq: FAQs): Promise<FAQs> {
    const newFaq = this.faqRepository.create(faq);
    return await this.faqRepository.save(newFaq);
  }

  async updateFaq(id: string, faq: FAQs): Promise<FAQs> {
    const existingFaq = await this.faqRepository.findOneBy({ id });
    if (!existingFaq) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Faq not found");
    }
    this.faqRepository.merge(existingFaq, faq);
    return await this.faqRepository.save(existingFaq);
  }

  async deleteFaq(id: string): Promise<FAQs> {
    const faq = await this.faqRepository.findOneBy({ id });
    if (!faq) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Faq not found");
    }
    return await this.faqRepository.remove(faq);
  }
}
