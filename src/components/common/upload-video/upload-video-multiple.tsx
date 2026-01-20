"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadVideoDropzone } from "./upload-video-dropzone";
import { useUploadVideoDropzone } from "./hooks/use-upload-video-dropzone";
import { useVideoDuration, formatDuration } from "./hooks/use-video-duration";
import { toast } from "@/components/common/toast/toast";
import type { UploadedVideo } from "./upload-video";

interface UploadVideoMultipleProps {
  uploadedFiles: UploadedVideo[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
}

export function UploadVideoMultiple({
  uploadedFiles,
  onFilesSelected,
  onRemoveFile,
  maxFiles = 10,
  maxSize = 500 * 1024 * 1024,
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/webm": [".webm"],
  },
  className,
  onError,
  onDropRejected,
}: UploadVideoMultipleProps) {
  const handleError = React.useCallback(
    (error: Error) => {
      toast.error(
        "Upload Error",
        error.message || "An error occurred during file upload"
      );
      onError?.(error);
    },
    [onError]
  );

  const handleDropRejected = React.useCallback(
    (fileRejections: any[]) => {
      toast.error("Incorrect File Type");
      onDropRejected?.(fileRejections);
    },
    [onDropRejected]
  );

  // 🔑 Enforce maxFiles here, taking already-uploaded files into account
  const handleFilesSelected = React.useCallback(
    (files: File[]) => {
      const remaining = maxFiles - uploadedFiles.length;

      if (remaining <= 0) {
        handleError(
          new Error(`You can only upload up to ${maxFiles} video(s).`)
        );
        return;
      }

      const acceptedFiles = files.slice(0, remaining);

      if (acceptedFiles.length < files.length) {
        handleError(
          new Error(
            `Only ${remaining} more video(s) can be uploaded (max ${maxFiles}).`
          )
        );
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [maxFiles, uploadedFiles.length, onFilesSelected, handleError]
  );

  const { getRootProps, getInputProps } = useUploadVideoDropzone({
    onFilesSelected: handleFilesSelected,
    maxFiles,
    maxSize,
    accept,
    onError: handleError,
    onDropRejected: handleDropRejected,
  });

  if (uploadedFiles.length === 0) {
    return (
      <UploadVideoDropzone
        onFilesSelected={handleFilesSelected}
        maxFiles={maxFiles}
        maxSize={maxSize}
        accept={accept}
        className={className}
        onError={handleError}
        onDropRejected={handleDropRejected}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium leading-none text-foreground">
          Walkthrough video
        </p>
        <button
          type="button"
          {...getRootProps()}
          disabled={uploadedFiles.length >= maxFiles}
          className={cn(
            "flex h-8 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 transition-colors duration-200 cursor-pointer",
            // Normal hover effects
            "hover:border-primary/50 hover:bg-primary/5",
            // Disabled base state
            "disabled:cursor-default disabled:opacity-60",
            // Disabled hover overrides (neutralize all hover styles)
            "disabled:hover:border-input disabled:hover:bg-background disabled:hover:text-current"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="size-4 text-primary" />
          <span className="text-sm font-medium leading-5 text-foreground">
            Upload More
          </span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {uploadedFiles.map((file) => (
          <VideoThumbnail
            key={file.id}
            file={file}
            onRemoveFile={onRemoveFile}
          />
        ))}
      </div>
    </div>
  );
}

function VideoThumbnail({
  file,
  onRemoveFile,
}: {
  file: UploadedVideo;
  onRemoveFile: (fileId: string) => void;
}) {
  const duration = useVideoDuration(file.url);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-md">
      <video
        src={file.url}
        className="h-full w-full object-cover"
        preload="metadata"
      />
      {file.status !== "uploading" && (
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
      {duration !== null && (
        <div className="absolute bottom-3 right-3 rounded-[6px] bg-muted-foreground flex items-center h-[22px] p-1">
          <span className="text-sm font-medium text-white">
            {formatDuration(duration)}
          </span>
        </div>
      )}
      {file.status === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
      {file.status !== "uploading" && (
        <button
          type="button"
          onClick={() => onRemoveFile(file.id)}
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:opacity-100 cursor-pointer z-10"
        >
          <X className="size-4 text-foreground" />
        </button>
      )}
    </div>
  );
}
