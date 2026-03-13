import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import ApiError from "./ApiError";
import httpStatusCodes from "http-status-codes";
import { logger } from "./logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  region: process.env.IDRIVE_E2_REGION,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET!,
  },
});

export async function getSignedMediaUrl(key: string, expiresIn = 900) {
  const command = new GetObjectCommand({
    Bucket: process.env.IDRIVE_E2_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Upload a file to iDrive-e2
 * @param file Multer file object
 * @param folder Folder path inside the bucket
 * @returns Public file URL
 */
export const uploadToIDrive = async (
  file: Express.Multer.File,
  folder: string = "uploads",
): Promise<string> => {
  try {
    if (!file || !file.path) {
      throw new Error("File path not found");
    }

    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.IDRIVE_E2_BUCKET_NAME!,
      Key: fileName,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      ACL: "private" as any,
    };

    await s3Client.send(new PutObjectCommand(params));
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return fileName;
  } catch (err) {
    logger.error("S3 Upload Error:", err);
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to upload file to S3",
    );
  }
};

/**
 * Delete a file from iDrive-e2
 * @param fileKey File key saved in DB
 */
export const deleteFromBucket = async (fileKey: string): Promise<void> => {
  try {
    const params = {
      Bucket: process.env.IDRIVE_E2_BUCKET!,
      Key: fileKey,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Deleted from bucket: ${fileKey}`);
  } catch (err) {
    logger.error("Bucket Delete Error:", err);
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to delete file"
    );
  }
};
