"use client";

import * as React from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadImageDropzone } from "./upload-image-dropzone";
import { useUploadDropzone } from "./hooks/use-upload-dropzone";
import { toast } from "@/components/common/toast/toast";
import type { UploadedFile } from "./upload-image";
import { createThumbnail } from "@/lib/utils";

interface UploadImageMultipleProps {
  uploadedFiles: UploadedFile[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  onImageClick?: (file: UploadedFile) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: any[]) => void;
  isInsideSheet?: boolean;
}

// Generate thumbnail from File object using canvas (much faster than full image)

// Optimized image component with thumbnail preview
const OptimizedImageItem = React.memo(
  ({
    file,
    onRemove,
    onClick,
    isClickable,
  }: {
    file: UploadedFile;
    onRemove: (id: string) => void;
    onClick?: (file: UploadedFile) => void;
    isClickable?: boolean;
  }) => {
    const [thumbnail, setThumbnail] = React.useState<string | null>(null);
    const [isVisible, setIsVisible] = React.useState(false);
    const imgRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (file.file) {
        createThumbnail(file.file).then(setThumbnail);
      } else if (file.url) {
        setThumbnail(file.url);
      }
    }, [file.file, file.url]);

    // Intersection observer for virtual scrolling
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { rootMargin: "50px" }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleClick = () => {
      if (isClickable && onClick && file.status !== "uploading") {
        onClick(file);
      }
    };

    return (
      <div
        ref={imgRef}
        onClick={handleClick}
        className={cn(
          "group relative aspect-square overflow-hidden rounded-md bg-muted",
          isClickable && file.status !== "uploading" && "cursor-pointer"
        )}
      >
        {!thumbnail && file.status !== "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {isVisible && thumbnail && (
          <img
            src={thumbnail}
            alt="Uploaded"
            className="h-full w-full object-cover"
          />
        )}

        {file.status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {file.status !== "uploading" && (
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        )}

        {file.status !== "uploading" && thumbnail && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file.id);
            }}
            className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 cursor-pointer hover:bg-white"
            aria-label="Remove image"
          >
            <X className="size-3.5 text-gray-700" />
          </button>
        )}
      </div>
    );
  }
);

OptimizedImageItem.displayName = "OptimizedImageItem";

export function UploadImageMultiple({
  uploadedFiles,
  onFilesSelected,
  onRemoveFile,
  onImageClick,
  maxFiles = 100,
  maxSize = 20 * 1024 * 1024,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  className,
  onError,
  onDropRejected,
  isInsideSheet = false,
}: UploadImageMultipleProps) {
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

  const handleFilesSelected = React.useCallback(
    (files: File[]) => {
      const remaining = maxFiles - uploadedFiles.length;

      if (remaining <= 0) {
        handleError(
          new Error(`You can only upload up to ${maxFiles} image(s).`)
        );
        return;
      }

      const acceptedFiles = files.slice(0, remaining);

      if (acceptedFiles.length < files.length) {
        handleError(
          new Error(
            `Only ${remaining} more image(s) can be uploaded (max ${maxFiles}).`
          )
        );
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [maxFiles, uploadedFiles.length, onFilesSelected, handleError]
  );

  const { getRootProps, getInputProps } = useUploadDropzone({
    onFilesSelected: handleFilesSelected,
    maxFiles,
    maxSize,
    accept,
    onError: handleError,
    onDropRejected: handleDropRejected,
  });

  // If no files uploaded yet, show the default dropzone
  if (uploadedFiles.length === 0) {
    return (
      <UploadImageDropzone
        onFilesSelected={handleFilesSelected}
        maxFiles={maxFiles}
        maxSize={maxSize}
        accept={accept}
        className={className}
        onError={handleError}
        onDropRejected={handleDropRejected}
        isInsideSheet={isInsideSheet}
      />
    );
  }

  // Show grid view with uploaded images
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isInsideSheet ? (
            <p className="text-sm font-medium leading-none text-foreground">
              Additional Photos
              <span className="ml-3 text-sm text-muted-foreground-2">
                {uploadedFiles.length}/{maxFiles}
              </span>
            </p>
          ) : (
            <p className="text-sm font-medium leading-none text-foreground">
              Add photos
            </p>
          )}
        </div>
        <button
          type="button"
          {...getRootProps()}
          disabled={uploadedFiles.length >= maxFiles}
          className={cn(
            "flex h-8 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 transition-colors duration-200 cursor-pointer",
            "hover:border-primary/50 hover:bg-primary/5",
            "disabled:cursor-default disabled:opacity-60",
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

      <div className="max-h-[485px] overflow-y-auto">
        <div
          className={cn(
            "grid gap-2",
            isInsideSheet ? "grid-cols-3" : "grid-cols-6"
          )}
        >
          {uploadedFiles.map((file) => (
            <OptimizedImageItem
              key={file.id}
              file={file}
              onRemove={onRemoveFile}
              onClick={onImageClick}
              isClickable={isInsideSheet && !!onImageClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
