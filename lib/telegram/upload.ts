import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { publicUrlFor } from "@/lib/r2";

let _s3: S3Client | null = null;
function s3() {
  if (_s3) return _s3;
  _s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _s3;
}

/**
 * Server-side upload, used by the Telegram bot since the user cannot do an
 * S3 presigned PUT from inside Telegram.
 */
export async function uploadBufferToR2(
  buf: Buffer,
  args: {
    kind: "payment" | "logo" | "attachment";
    userId: string;
    ext: string; // includes leading dot
    contentType: string;
  },
): Promise<string> {
  const key = `${args.kind}/${args.userId}/${Date.now()}-${randomUUID()}${args.ext}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: args.contentType,
    }),
  );
  return publicUrlFor(key);
}
