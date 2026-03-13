import { Request, Response } from "express";
import { MediaService } from "../services/media.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import { Media } from "../models/media.model";
import { paginationFields } from "../const/pagination.const";
import { IPaginationOptions } from "../types";
import pick from "../utils/pick";
import httpStatusCodes from "http-status-codes";
import { uploadToS3 } from "../utils/idrive-client";
import ApiError from "../utils/ApiError";
import { AddMediaDTO } from "../dto/media.dto";
import { logger } from "../utils/logger";

export class MediaController {
  private mediaService = new MediaService();

  public getAllMedia = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions: IPaginationOptions = pick(
      req.query,
      paginationFields,
    );
    const medias = await this.mediaService.getAllMedia(paginationOptions);
    sendResponse<Media[]>(res, {
      message: "Media fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: medias.data,
      meta: medias.meta,
      success: true,
    });
  });

  public getMediaById = catchAsync(async (req: Request, res: Response) => {
    const media = await this.mediaService.getMediaById(req.params.id);
    sendResponse<Media>(res, {
      message: "Media fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: media,
      success: true,
    });
  });

  public addMultipleMedia = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "No files uploaded");
    }

    const uploadMedia: AddMediaDTO[] = [];

    // Upload all files concurrently
    const uploadedResults = await Promise.all(
      files.map(async (file) => {
        try {
          const url = await uploadToS3(file);
          if (!url) return null;

          return {
            file_name: file.originalname,
            url,
            file_type: file.mimetype,
            file_size: file.size,
            alt_text: req.body.alt_text || null,
          } as AddMediaDTO;
        } catch (error) {
          logger.error(`Failed to upload ${file.originalname}:`, error);
          return null;
        }
      }),
    );

    // Filter out any failed uploads
    for (const media of uploadedResults) {
      if (media) uploadMedia.push(media);
    }

    if (uploadMedia.length === 0) {
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to upload all files",
      );
    }

    // Save to DB
    const medias = await this.mediaService.addMultipleMedia(uploadMedia);

    sendResponse<Media[]>(res, {
      message: "Media added successfully",
      statusCode: httpStatusCodes.OK,
      data: medias,
      success: true,
    });
  });

  public deleteMultipleMedia = catchAsync(
    async (req: Request, res: Response) => {
      await this.mediaService.deleteMultipleMedia(req.body.urls);
      sendResponse(res, {
        message: "Media deleted successfully",
        statusCode: httpStatusCodes.OK,
        success: true,
      });
    },
  );
}
