import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import {
  UPLOAD_LIMITS,
  formatBytes,
  type UploadKind,
} from "@/lib/upload-limits";

export { UPLOAD_LIMITS } from "@/lib/upload-limits";
export type { UploadKind } from "@/lib/upload-limits";

/**
 * Cloudflare R2 is S3-compatible. We use the AWS SDK with a Cloudflare endpoint.
 */
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
    // Cloudflare R2 chokes on the auto-injected checksum headers/query
    // params added by aws-sdk v3.730+. Disable them — presigned PUTs work
    // again, and we don't rely on integrity checksums anyway.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return _s3;
}


export interface PresignParams {
  kind: UploadKind;
  contentType: string;
  contentLength: number;
  userId: string;
}

export interface PresignResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
}

export async function createPresignedUpload(
  params: PresignParams,
): Promise<PresignResult> {
  const { kind, contentType, contentLength, userId } = params;
  const limits = UPLOAD_LIMITS[kind];

  if (!limits.mime.test(contentType)) {
    throw new Error(`Unsupported content type for ${kind}: ${contentType}`);
  }
  if (contentLength <= 0) {
    throw new Error("Empty file");
  }
  if (contentLength > limits.maxBytes) {
    throw new Error(
      `File too large: ${formatBytes(contentLength)}. Max allowed for ${kind} is ${limits.label}.`,
    );
  }

  const ext = mimeToExt(contentType);
  const key = `${kind}/${userId}/${Date.now()}-${randomUUID()}${ext}`;
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });

  const expiresInSeconds = 60 * 5; // 5 minutes
  const uploadUrl = await getSignedUrl(s3(), command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    key,
    publicUrl: publicUrlFor(key),
    expiresInSeconds,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(contentLength),
    },
  };
}

export function publicUrlFor(key: string): string {
  if (env.R2_PUBLIC_BASE_URL) {
    return `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }
  // Fallback: signed GET URL via our /api/files route would be safer in prod,
  // but the URL is stored so we can rotate later.
  return `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`;
}

export async function getSignedGetUrl(key: string, expiresInSeconds = 60 * 60) {
  const cmd = new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key });
  return getSignedUrl(s3(), cmd, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
  };
  return map[mime.toLowerCase()] ?? "";
}
