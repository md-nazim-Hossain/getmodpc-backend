import { S3Client } from "@aws-sdk/client-s3";
export const s3 = new S3Client({
  endpoint: process.env.IDRIVE_E2_ENDPOINT,
  region: process.env.IDRIVE_E2_REGION,
  credentials: {
    accessKeyId: process.env.IDRIVE_E2_KEY!,
    secretAccessKey: process.env.IDRIVE_E2_SECRET!,
  },
});
