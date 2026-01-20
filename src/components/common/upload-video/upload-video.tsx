"use client";

import * as React from "react";
import { UploadVideoSingle } from "./upload-video-single";
import { UploadVideoMultiple } from "./upload-video-multiple";

export interface UploadedVideo {
  id: string;
  url: string;
  file: File;
  status?: "uploading" | "success" | "error";
  progress?: number;
}

export interface UploadVideoProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  variant: "single" | "multiple";
  videoUrl?: string | null;
  onRemove?: () => void;
  uploadedFiles?: UploadedVideo[];
  onRemoveFile?: (fileId: string) => void;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
}

export function UploadVideo({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 500 * 1024 * 1024,
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/webm": [".webm"],
  },
  className,
  variant,
  videoUrl,
  onRemove,
  uploadedFiles = [],
  onRemoveFile,
  onError,
  onDropRejected,
}: UploadVideoProps) {
  if (variant === "single") {
    return (
      <UploadVideoSingle
        videoUrl={videoUrl}
        onRemove={onRemove || (() => {})}
        onFilesSelected={onFilesSelected}
        maxSize={maxSize}
        accept={accept}
        className={className}
      />
    );
  }

  return (
    <UploadVideoMultiple
      uploadedFiles={uploadedFiles}
      onFilesSelected={onFilesSelected}
      onRemoveFile={onRemoveFile || (() => {})}
      maxFiles={maxFiles}
      maxSize={maxSize}
      accept={accept}
      className={className}
      onError={onError}
      onDropRejected={onDropRejected}
    />
  );
}

