import { AppDataSource } from "../config/db";
import { TagDeveloperConstant } from "../const/tag_developer.const";
import { Tag } from "../models/tag.model";
import {
  IGenericResponse,
  IPaginationOptions,
  ITagAndDeveloperFilters,
} from "../types";
import ApiError from "../utils/ApiError";
import { generateUniqueSlug } from "../utils/generate-slug";
import { calculatePagination } from "../utils/pagination";
import httpStatusCodes from "http-status-codes";

export class TagService {
  private tagRepository = AppDataSource.getRepository(Tag);

  async getAllTags(
    filters: ITagAndDeveloperFilters,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Tag[]>> {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sort_by, sort_order } =
      calculatePagination(paginationOptions);

    const query = this.tagRepository.createQueryBuilder("tag");
    if (searchTerm) {
      const searchConditions =
        TagDeveloperConstant.tagDeveloperSearchFields.map(
          (field) => `tag.${field} ILIKE :search`,
        );
      query.andWhere(`(${searchConditions.join(" OR ")})`, {
        search: `%${searchTerm}%`,
      });
    }

    Object.keys(filtersData).forEach((key) => {
      query.andWhere(`tag.${key} = :${key}`, {
        [key]: (filtersData as any)[key],
      });
    });

    const total = await query.getCount();
    query.orderBy(`tag.${sort_by}`, sort_order as "ASC" | "DESC");
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

  async getTagById(id: string): Promise<Tag | null> {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Tag not found");
    }
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const tag = await this.tagRepository.findOneBy({ slug });
    if (!tag) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Tag not found");
    }
    return tag;
  }

  async createTag(tag: Tag): Promise<Tag> {
    const slug = await generateUniqueSlug(tag.name!, this.tagRepository);
    const newTag = this.tagRepository.create({
      ...tag,
      slug,
    });
    return this.tagRepository.save(newTag);
  }

  async updateTag(id: string, tag: Tag): Promise<Tag> {
    const existingTag = await this.tagRepository.findOneBy({ id });
    if (!existingTag) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Tag not found");
    }
    if (tag.name && existingTag.name !== tag.name) {
      existingTag.slug = await generateUniqueSlug(
        tag.name,
        this.tagRepository,
        id,
      );
    }
    this.tagRepository.merge(existingTag, tag);
    return this.tagRepository.save(existingTag);
  }

  async deleteTag(id: string): Promise<Tag> {
    const existingTag = await this.tagRepository.findOneBy({ id });
    if (!existingTag) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Tag not found");
    }
    return this.tagRepository.remove(existingTag);
  }
}
