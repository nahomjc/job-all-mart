"use client";

import * as React from "react";
import { Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  UPLOAD_LIMITS,
  formatBytes,
  type UploadKind,
} from "@/lib/upload-limits";

interface FileUploaderProps {
  kind: UploadKind;
  /** Hidden form field that will hold the uploaded R2 key. */
  name: string;
  defaultValue?: string;
  label?: string;
  helperText?: string;
  className?: string;
  /** Optional: notify parent of new key. */
  onUploaded?: (key: string, publicUrl: string) => void;
}

interface UploadState {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  key?: string;
  publicUrl?: string;
  fileName?: string;
  error?: string;
}

export function FileUploader({
  kind,
  name,
  defaultValue,
  label,
  helperText,
  className,
  onUploaded,
}: FileUploaderProps) {
  const [state, setState] = React.useState<UploadState>({
    status: defaultValue ? "done" : "idle",
    progress: 0,
    key: defaultValue,
  });
  const inputRef = React.useRef<HTMLInputElement>(null);
  const limits = UPLOAD_LIMITS[kind];

  async function handleFile(file: File) {
    // Client-side validation: fail loudly *before* hitting the network.
    if (!limits.mime.test(file.type)) {
      const message = `Unsupported file type: ${file.type || "unknown"}. Allowed: ${limits.accept}.`;
      setState({ status: "error", progress: 0, error: message });
      toast.error(message);
      return;
    }
    if (file.size <= 0) {
      const message = "File is empty.";
      setState({ status: "error", progress: 0, error: message });
      toast.error(message);
      return;
    }
    if (file.size > limits.maxBytes) {
      const message = `${file.name} is ${formatBytes(file.size)}. Max ${limits.label} for ${kind}.`;
      setState({ status: "error", progress: 0, error: message });
      toast.error(message);
      return;
    }

    setState({ status: "uploading", progress: 0, fileName: file.name });
    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          contentType: file.type,
          contentLength: file.size,
        }),
      });
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to prepare upload");
      }
      const presign = (await presignRes.json()) as {
        uploadUrl: string;
        key: string;
        publicUrl: string;
        headers: Record<string, string>;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presign.uploadUrl);
        for (const [k, v] of Object.entries(presign.headers)) {
          xhr.setRequestHeader(k, v);
        }
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setState((s) => ({ ...s, progress: (e.loaded / e.total) * 100 }));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setState({
        status: "done",
        progress: 100,
        key: presign.key,
        publicUrl: presign.publicUrl,
        fileName: file.name,
      });
      onUploaded?.(presign.key, presign.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState({ status: "error", progress: 0, error: message });
      toast.error(message);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input type="hidden" name={name} value={state.key ?? ""} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept={limits.accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // Reset so picking the same file again still triggers onChange.
          e.target.value = "";
        }}
      />

      {state.status === "idle" || state.status === "error" ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-6 text-sm transition",
            state.status === "error"
              ? "border-destructive/60 text-destructive hover:border-destructive"
              : "text-muted-foreground hover:border-primary hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <Upload className="size-4" />
            Click to upload {kind === "payment" ? "payment screenshot" : kind}
          </span>
          <span className="text-xs opacity-80">Max {limits.label}</span>
          {state.status === "error" && state.error && (
            <span className="mt-1 block max-w-xs text-center text-xs">
              {state.error}
            </span>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
          <FileImage className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="line-clamp-1 font-medium">
              {state.fileName ?? "Uploaded"}
            </p>
            {state.status === "uploading" ? (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Uploaded</p>
            )}
          </div>
          {state.status === "done" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setState({ status: "idle", progress: 0 });
              }}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
