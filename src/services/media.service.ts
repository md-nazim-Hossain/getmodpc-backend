import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
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
import { IMedia, IMediaAction } from "../types";
import path from "path";
export class MediaService {
  private async getSignedMediaUrl(key: string, expiresIn = 900) {
    const command = new GetObjectCommand({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  }

  async getFolderContents(folderPrefix: string = ""): Promise<{
    folders: string[];
    files: IMedia[];
  }> {
    if (folderPrefix && !folderPrefix.endsWith("/")) folderPrefix += "/";

    const command = new ListObjectsV2Command({
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Prefix: folderPrefix,
      Delimiter: "/",
    });

    const response = await s3.send(command);

    const folders: string[] = (response.CommonPrefixes || []).map((p) =>
      p.Prefix!.replace(folderPrefix, ""),
    );

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

    return { folders, files };
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
      Bucket: process.env.IDRIVE_E2_BUCKET!,
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

  async uploadMediasToBucket(
    files: Express.Multer.File[],
    folder: string = "uploads",
  ): Promise<IMediaAction> {
    if (!files || files.length === 0) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "No files uploaded");
    }

    const uploadedKeys = await Promise.all(
      files.map(async (file) => {
        const extension = file.originalname.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${uuidv4()}.${extension}`;

        try {
          const params = {
            Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
            Key: fileName,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
            ACL: "private" as any,
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
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
        Prefix: folderPrefix,
      });

      const listResponse = await s3.send(listCommand);
      const objects = listResponse.Contents || [];

      if (objects.length === 0) return { success: [], failed: [] };

      const deleteParams = {
        Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
        Delete: {
          Objects: objects.map((obj) => ({ Key: obj.Key! })),
          Quiet: false,
        },
      };

      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      const deleteResponse = await s3.send(deleteCommand);

      const deletedKeys = (deleteResponse.Deleted || []).map((d) => d.Key!);
      const failedKeys = (deleteResponse.Errors || []).map((e) => e.Key!);

      return { success: deletedKeys, failed: failedKeys };
    } catch (err) {
      logger.error("Failed to delete folder:", folderPrefix, err);
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to delete folder: ${folderPrefix}`,
      );
    }
  }
}
