import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../utils/idrive-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { logger } from "../utils/logger";
import {
  IAllMediaResponse,
  IGenericResponse,
  IMedia,
  IMediaAction,
} from "../types";
import path from "path";
export class MediaService {
  private async getSignedMediaUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  }

  async getAllFolderMedias(
    folderPrefix: string = "",
    limit: number,
    continuationToken?: string,
  ): Promise<IAllMediaResponse> {
    if (folderPrefix && !folderPrefix.endsWith("/")) folderPrefix += "/";

    const command = new ListObjectsV2Command({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Prefix: folderPrefix,
      Delimiter: "/",
      MaxKeys: limit,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);

    const folders: string[] = [];
    for (const p of response.CommonPrefixes || []) {
      const childPrefix = p.Prefix!;

      const listObjects = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
          Prefix: childPrefix,
          MaxKeys: 2,
        }),
      );

      const hasObjects = (listObjects.Contents || []).some(
        (obj) => obj.Key !== childPrefix,
      );
      if (
        hasObjects ||
        listObjects.Contents?.some((obj) => obj.Key === childPrefix)
      ) {
        folders.push(childPrefix.replace(folderPrefix, ""));
      }
    }

    // files
    const files = await Promise.all(
      (response.Contents || [])
        .filter((obj) => obj.Key !== folderPrefix)
        .map(async (obj) => {
          const key = obj.Key!;
          const name = path.basename(key);
          const size = obj.Size || 0;
          const created_at = obj.LastModified || null;
          const ext = path.extname(key).substring(1);
          const type = ext;

          const url = await this.getSignedMediaUrl(key);

          return { name, key, size, type, created_at, url };
        }),
    );

    return {
      folders,
      files,
      nextToken: response.NextContinuationToken,
      hasMore: response.IsTruncated ?? false,
    };
  }

  async getAllMedias(
    limit: number,
    page: number,
    searchTerm?: string,
    dateFilter?: string,
  ): Promise<IGenericResponse<IMedia[]>> {
    const folderPrefix = "";
    const command = new ListObjectsV2Command({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Prefix: folderPrefix,
      Delimiter: "/",
    });
    const response = await s3.send(command);
    // files
    const allFilesPromises = (response.Contents || [])
      .filter((obj) => obj.Key !== folderPrefix)
      .map(async (obj) => {
        const key = obj.Key!;
        const name = path.basename(key);
        const size = obj.Size || 0;
        const created_at = obj.LastModified || null;
        const ext = path.extname(key).substring(1);
        const type = ext;

        const url = await this.getSignedMediaUrl(key);

        return { name, key, size, type, created_at, url };
      });

    let files = await Promise.all(allFilesPromises);

    if (searchTerm) {
      files = files.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (dateFilter) {
      const dateFilterTrimmed = dateFilter.trim();
      let year: number | undefined;
      let month: number | undefined;

      // Check for YYYY-M format
      if (/^\d{4}-\d{1,2}$/.test(dateFilterTrimmed)) {
        const [yearStr, monthStr] = dateFilterTrimmed.split("-");
        year = parseInt(yearStr, 10);
        month = parseInt(monthStr, 10) - 1; // JS months are 0-based
        if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
          year = undefined;
          month = undefined;
        }
      } else {
        // Fallback to month year format
        const months: { [key: string]: number } = {
          january: 0,
          february: 1,
          march: 2,
          april: 3,
          may: 4,
          june: 5,
          july: 6,
          august: 7,
          september: 8,
          october: 9,
          november: 10,
          december: 11,
          jan: 0,
          feb: 1,
          mar: 2,
          apr: 3,
          jun: 5,
          jul: 6,
          aug: 7,
          sep: 8,
          oct: 9,
          nov: 10,
          dec: 11,
        };
        const parts = dateFilterTrimmed.split(/\s+/);
        if (parts.length === 2) {
          const [monthStr, yearStr] = parts;
          month = months[monthStr.toLowerCase()];
          year = parseInt(yearStr, 10);
          if (month === undefined || isNaN(year)) {
            year = undefined;
            month = undefined;
          }
        }
      }

      if (year !== undefined && month !== undefined) {
        files = files.filter(
          (f) =>
            f.created_at &&
            f.created_at.getMonth() === month &&
            f.created_at.getFullYear() === year,
        );
      }
    }

    // pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = files.slice(startIndex, endIndex);
    const hasNextPage = endIndex < files.length;

    return {
      data,
      meta: {
        total: files.length,
        hasNextPage,
        limit,
        page,
        totalPages: Math.ceil(files.length / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getMediaByKey(key: string): Promise<IMedia> {
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Key: key,
    });
    const response = await s3.send(command);
    const size = response.ContentLength || 0;
    const created_at = response.LastModified || null;
    const url = await this.getSignedMediaUrl(key);
    return { name: path.basename(key), key, size, type: "", created_at, url };
  }

  async createFolder(folderName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Key: `${folderName}/`,
      Body: "",
    });

    const result = await s3.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to create folder",
      );
    }
    return folderName;
  }

  async renameFolder(
    oldPrefix: string,
    newPrefix: string,
  ): Promise<{ moved: number }> {
    if (!oldPrefix.endsWith("/")) oldPrefix += "/";
    if (!newPrefix.endsWith("/")) newPrefix += "/";

    let continuationToken: string | undefined;
    let movedCount = 0;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
        Prefix: oldPrefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);
      const objects = listResponse.Contents || [];

      for (const obj of objects) {
        const oldKey = obj.Key!;
        const newKey = oldKey.replace(oldPrefix, newPrefix);

        await s3.send(
          new CopyObjectCommand({
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            CopySource: `${process.env.IDRIVE_E2_BUCKET_NAME}/${oldKey}`,
            Key: newKey,
          }),
        );

        movedCount++;
      }

      if (objects.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < objects.length; i += batchSize) {
          const batch = objects.slice(i, i + batchSize);
          const deleteParams: DeleteObjectsCommandInput = {
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            Delete: {
              Objects: batch.map((o) => ({ Key: o.Key! })),
              Quiet: false,
            },
          };
          await s3.send(new DeleteObjectsCommand(deleteParams));
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    try {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
          Delete: { Objects: [{ Key: oldPrefix }] },
        }),
      );
    } catch (err) {}

    return { moved: movedCount };
  }

  async uploadMediasToBucket(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<IMediaAction> {
    if (!files || files.length === 0) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "No files uploaded");
    }

    const uploadedKeys = await Promise.all(
      files.map(async (file) => {
        const extension = file.originalname.split(".").pop();
        let fileName = folder
          ? `${folder}/${Date.now()}-${uuidv4()}.${extension}`
          : `${Date.now()}-${uuidv4()}.${extension}`;

        try {
          const params = {
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            Key: fileName,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
            // ACL: "private" as any,
          };

          await s3.send(new PutObjectCommand(params));
          return {
            key: fileName,
            success: true,
          };
        } catch (err) {
          logger.error("Upload failed for file:", file.originalname, err);
          return {
            key: file.originalname,
            success: false,
          };
        } finally {
          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }),
    );
    const failed = uploadedKeys.filter((r) => !r.success).map((r) => r.key);
    const success = uploadedKeys.filter((r) => r.success).map((r) => r.key);
    return {
      success,
      failed,
    };
  }

  async deletedMedias(fileKeys: string[]): Promise<IMediaAction> {
    if (!fileKeys || fileKeys.length === 0) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "No files to delete");
    }

    const results = await Promise.all(
      fileKeys.map(async (key) => {
        try {
          const params = {
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            Key: key,
          };
          await s3.send(new DeleteObjectCommand(params));
          return { key, success: true };
        } catch (err) {
          logger.error("Failed to delete file:", key, err);
          return { key, success: false };
        }
      }),
    );
    const success = results.filter((r) => r.success).map((r) => r.key);
    const failed = results.filter((r) => !r.success).map((r) => r.key);

    return { success, failed };
  }

  async deleteFolder(folderPrefix: string): Promise<IMediaAction> {
    if (!folderPrefix.endsWith("/")) folderPrefix += "/";

    let continuationToken: string | undefined;
    const success: string[] = [];
    const failed: string[] = [];

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
        Prefix: folderPrefix,
        ContinuationToken: continuationToken,
      });

      const listResponse = await s3.send(listCommand);
      const objects = listResponse.Contents || [];

      if (objects.length > 0) {
        const batchSize = 1000;
        for (let i = 0; i < objects.length; i += batchSize) {
          const batch = objects.slice(i, i + batchSize);

          const deleteParams: DeleteObjectsCommandInput = {
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            Delete: {
              Objects: batch.map((o) => ({ Key: o.Key! })),
              Quiet: false,
            },
          };

          const deleteResponse = await s3.send(
            new DeleteObjectsCommand(deleteParams),
          );
          (deleteResponse.Deleted || []).forEach((d) => success.push(d.Key!));
          (deleteResponse.Errors || []).forEach((e) => failed.push(e.Key!));
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    try {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
          Delete: { Objects: [{ Key: folderPrefix }] },
        }),
      );
    } catch (err) {}

    return { success, failed };
  }
}
