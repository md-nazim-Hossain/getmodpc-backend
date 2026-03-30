import { AppDataSource } from "../config/db";
import { TagDeveloperConstant } from "../const/tag_developer.const";
import { Developer } from "../models/developer.model";
import {
  IGenericResponse,
  IPaginationOptions,
  ITagAndDeveloperFilters,
} from "../types";
import ApiError from "../utils/ApiError";
import { generateUniqueSlug } from "../utils/generate-slug";
import {
  calculatePagination,
  calculatePaginationMeta,
} from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class DeveloperService {
  private developerRepository = AppDataSource.getRepository(Developer);

  async getAllDevelopers(
    filters: ITagAndDeveloperFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Developer[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.developerRepository.createQueryBuilder("Developer");
    if (searchTerm) {
      const searchConditions =
        TagDeveloperConstant.tagDeveloperSearchFields.map(
          (field) => `Developer.${field} ILIKE :search`,
        );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`Developer.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`Developer.${sort_by}`, sort_order as "ASC" | "DESC");
    query.skip(skip).take(limit);

    const data = await query.getMany();
    const meta = calculatePaginationMeta(total, page, limit);

    return {
      data,
      meta,
    };
  }

  async getDeveloperById(id: string): Promise<Developer | null> {
    const developer = await this.developerRepository.findOneBy({ id });
    if (!developer) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Developer not found");
    }
    return developer;
  }

  async getDeveloperBySlug(slug: string): Promise<Developer | null> {
    const developer = await this.developerRepository.findOneBy({ slug });
    if (!developer) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Developer not found");
    }
    return developer;
  }

  async createDeveloper(developer: Developer): Promise<Developer> {
    const slug = await generateUniqueSlug(
      developer.name!,
      this.developerRepository,
    );
    const newDeveloper = this.developerRepository.create({
      ...developer,
      slug,
    });
    return this.developerRepository.save(newDeveloper);
  }

  async updateDeveloper(
    id: string,
    developer: Partial<Developer>,
  ): Promise<Developer> {
    const existingDeveloper = await this.developerRepository.findOneBy({ id });
    if (!existingDeveloper) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Developer not found");
    }
    if (developer.name && existingDeveloper.name !== developer.name) {
      existingDeveloper.slug = await generateUniqueSlug(
        developer.name,
        this.developerRepository,
        id,
      );
    }
    this.developerRepository.merge(existingDeveloper, developer);
    return this.developerRepository.save(existingDeveloper);
  }

  async deleteDeveloper(id: string): Promise<Developer> {
    const existingDeveloper = await this.developerRepository.findOneBy({ id });
    if (!existingDeveloper) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Developer not found");
    }
    return this.developerRepository.remove(existingDeveloper);
  }
}
