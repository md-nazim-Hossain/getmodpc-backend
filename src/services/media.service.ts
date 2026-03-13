import { AppDataSource } from "../config/db";
import { Media } from "../models/media.model";
import { IGenericResponse, IPaginationOptions } from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import { calculatePagination } from "../utils/pagination";
import { deleteFromS3 } from "../utils/idrive-client";
import { In } from "typeorm";
import { AddMediaDTO } from "../dto/media.dto";

export class MediaService {
  private mediaRepository = AppDataSource.getRepository(Media);

  async getMediaById(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) {
      throw new ApiError(httpStatusCodes.NOT_FOUND, "Media not found");
    }
    return media;
  }

  async getAllMedia(
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<Media[]>> {
    const { limit, page, sortBy, sortOrder, skip } =
      calculatePagination(paginationOptions);
    const [data, total] = await this.mediaRepository
      .createQueryBuilder("media")
      .orderBy(`media.${sortBy || "createdAt"}`, sortOrder || "DESC")
      .skip(skip)
      .limit(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        limit,
        page,
        total,
      },
    };
  }

  async addMultipleMedia(payloads: AddMediaDTO[]): Promise<Media[]> {
    if (!payloads || payloads.length === 0) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "No media payloads provided",
      );
    }

    const medias = this.mediaRepository.create(payloads);
    return await this.mediaRepository.save(medias);
  }

  async deleteMultipleMedia(urls: string[]): Promise<void> {
    const medias = await this.mediaRepository.findBy({ url: In(urls) });

    if (medias.length === 0) {
      throw new ApiError(
        httpStatusCodes.NOT_FOUND,
        "No media found for given URLs",
      );
    }

    // Delete from S3 concurrently
    await Promise.all(medias.map((m) => deleteFromS3(m.url)));

    // Then delete from DB
    await this.mediaRepository.delete({ url: In(urls) });
  }
}
