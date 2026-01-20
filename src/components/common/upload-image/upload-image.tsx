"use client";

import * as React from "react";
import { UploadImageSingle } from "./upload-image-single";
import { UploadImageMultiple } from "./upload-image-multiple";

export interface UploadedFile {
  id: string;
  url: string;
  file: File;
  status?: "uploading" | "success" | "error";
  progress?: number;
}

export interface UploadImageProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  variant: "single" | "multiple";
  // Single variant props
  imageUrl?: string | null;
  onRemove?: () => void;
  // Multiple variant props
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (fileId: string) => void;
  onImageClick?: (file: UploadedFile) => void;
  // Error handling
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
  onFileSizeError?: (hasError: boolean) => void;
  isInsideSheet?: boolean;
}

export function UploadImage({
  onFilesSelected,
  maxFiles = 100,
  maxSize = 20 * 1024 * 1024,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  className,
  variant,
  imageUrl,
  onRemove,
  uploadedFiles = [],
  onRemoveFile,
  onImageClick,
  onError,
  onDropRejected,
  onFileSizeError,
  isInsideSheet = false,
}: UploadImageProps) {
  if (variant === "single") {
    return (
      <UploadImageSingle
        imageUrl={imageUrl}
        onRemove={onRemove || (() => {})}
        onFilesSelected={onFilesSelected}
        maxSize={maxSize}
        accept={accept}
        className={className}
        onError={onFileSizeError}
      />
    );
  }

  return (
    <UploadImageMultiple
      uploadedFiles={uploadedFiles}
      onFilesSelected={onFilesSelected}
      onRemoveFile={onRemoveFile || (() => {})}
      onImageClick={onImageClick}
      maxFiles={maxFiles}
      maxSize={maxSize}
      accept={accept}
      className={className}
      onError={onError}
      onDropRejected={onDropRejected}
      isInsideSheet={isInsideSheet}
    />
  );
}
