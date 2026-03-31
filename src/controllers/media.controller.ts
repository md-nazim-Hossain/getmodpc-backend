import { Request, Response } from "express";
import { MediaService } from "../services/media.service";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/ApiResponse";
import { IAllMediaResponse, IMedia, IMediaAction } from "../types";
import httpStatusCodes from "http-status-codes";

export class MediaController {
  private mediaService = new MediaService();

  public getAllFolderMedias = catchAsync(
    async (req: Request, res: Response) => {
      const folder = req.query.folder as string;
      const limit = Number(req.query.limit || 20);
      const continuationToken = req.query.continuationToken as string;
      const medias = await this.mediaService.getAllFolderMedias(
        folder,
        limit,
        continuationToken,
      );
      sendResponse<IAllMediaResponse>(res, {
        message: "Media fetched successfully",
        statusCode: httpStatusCodes.OK,
        data: medias,
        success: true,
      });
    },
  );

  public getAllMedias = catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit || 20);
    const page = Number(req.query.page || 1);
    const searchTerm = req.query.searchTerm as string;
    const dateFilter = req.query.dateFilter as string;
    const medias = await this.mediaService.getAllMedias(
      limit,
      page,
      searchTerm,
      dateFilter,
    );
    sendResponse<IMedia[]>(res, {
      message: "Media fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: medias.data,
      meta: medias.meta,
      success: true,
    });
  });

  public getMediaByKey = catchAsync(async (req: Request, res: Response) => {
    const media = await this.mediaService.getMediaByKey(req.params.key);
    sendResponse<IMedia>(res, {
      message: "Media fetched successfully",
      statusCode: httpStatusCodes.OK,
      data: media,
      success: true,
    });
  });

  public createFolder = catchAsync(async (req: Request, res: Response) => {
    const folderName = req.body.folderName;
    const folder = await this.mediaService.createFolder(folderName);
    sendResponse<string>(res, {
      message: "Folder created successfully",
      statusCode: httpStatusCodes.OK,
      data: folder,
      success: true,
    });
  });

  public renameFolder = catchAsync(async (req: Request, res: Response) => {
    const { oldFolder, newFolder } = req.body;
    const folder = await this.mediaService.renameFolder(oldFolder, newFolder);
    sendResponse<{ moved: number }>(res, {
      message: "Folder renamed successfully",
      statusCode: httpStatusCodes.OK,
      data: folder,
      success: true,
    });
  });

  public uploadMediasToBucket = catchAsync(
    async (req: Request, res: Response) => {
      const files = req.files as Express.Multer.File[];
      const folder = req.body.folder;
      const media = await this.mediaService.uploadMediasToBucket(files, folder);
      sendResponse<IMediaAction>(res, {
        message: "Media uploaded successfully",
        statusCode: httpStatusCodes.OK,
        data: media,
        success: true,
      });
    },
  );

  public deletedMedias = catchAsync(async (req: Request, res: Response) => {
    const fileKeys = req.body.fileKeys;
    const media = await this.mediaService.deletedMedias(fileKeys);
    sendResponse<IMediaAction>(res, {
      message: "Media deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: media,
      success: true,
    });
  });

  public deleteFolder = catchAsync(async (req: Request, res: Response) => {
    const folderPrefix = req.body.folderName;
    const media = await this.mediaService.deleteFolder(folderPrefix);
    sendResponse<IMediaAction>(res, {
      message: "Folder deleted successfully",
      statusCode: httpStatusCodes.OK,
      data: media,
      success: true,
    });
  });
}
