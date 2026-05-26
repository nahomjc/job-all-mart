/**
 * Upload constraints shared between the server (presigning) and the client
 * (the FileUploader pre-validates so the user sees errors instantly).
 *
 * This file has NO server-only imports so it's safe to bundle into a
 * "use client" component.
 */

export type UploadKind = "payment" | "logo" | "attachment";

export interface UploadLimit {
  maxBytes: number;
  /** RegExp matching the accepted MIME types. */
  mime: RegExp;
  /** `accept` attribute value for `<input type="file">`. */
  accept: string;
  /** Human-readable max size, e.g. "4 MB". */
  label: string;
}

export const UPLOAD_LIMITS: Record<UploadKind, UploadLimit> = {
  payment: {
    maxBytes: 5 * 1024 * 1024,
    mime: /^image\/(png|jpe?g|webp|gif)$/i,
    accept: "image/png,image/jpeg,image/webp,image/gif",
    label: "5 MB",
  },
  logo: {
    maxBytes: 4 * 1024 * 1024,
    mime: /^image\/(png|jpe?g|webp|svg\+xml)$/i,
    accept: "image/png,image/jpeg,image/webp,image/svg+xml",
    label: "4 MB",
  },
  attachment: {
    maxBytes: 8 * 1024 * 1024,
    mime: /^(image\/.+|application\/pdf)$/i,
    accept: "image/*,application/pdf",
    label: "8 MB",
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
