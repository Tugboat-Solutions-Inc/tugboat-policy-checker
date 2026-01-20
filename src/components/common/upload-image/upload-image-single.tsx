"use client";

import * as React from "react";
import { ImagePlus, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUploadDropzone } from "./hooks/use-upload-dropzone";
import { toast } from "@/components/common/toast/toast";

interface UploadImageSingleProps {
  imageUrl?: string | null;
  onRemove: () => void;
  onFilesSelected: (files: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  onError?: (hasError: boolean) => void;
  isUploading?: boolean;
}

export function UploadImageSingle({
  imageUrl,
  onRemove,
  onFilesSelected,
  maxSize = 20 * 1024 * 1024,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  className,
  onError,
  isUploading = false,
}: UploadImageSingleProps) {
  const [fileSizeError, setFileSizeError] = React.useState(false);
  const [isImageLoading, setIsImageLoading] = React.useState(true);

  const handleError = React.useCallback((error: Error) => {
    toast.error(
      "Upload Error",
      error.message || "An error occurred during file upload"
    );
  }, []);

  const handleDropRejected = React.useCallback(
    (fileRejections: any[]) => {
      const hasSizeError = fileRejections.some((rejection) =>
        rejection.errors.some((error: any) => error.code === "file-too-large")
      );
      const hasTypeError = fileRejections.some((rejection) =>
        rejection.errors.some((error: any) => error.code === "file-invalid-type")
      );

      if (hasSizeError) {
        setFileSizeError(true);
        onError?.(true);
        toast.error(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      } else if (hasTypeError) {
        setFileSizeError(false);
        onError?.(false);
        toast.error("Invalid file type. Please upload JPG, PNG, or WEBP images.");
      } else {
        setFileSizeError(false);
        onError?.(false);
        toast.error("File could not be uploaded.");
      }
    },
    [onError, maxSize]
  );

  React.useEffect(() => {
    if (imageUrl) {
      setFileSizeError(false);
      onError?.(false);
      setIsImageLoading(true);
    }
  }, [imageUrl, onError]);

  const { getRootProps, getInputProps, isDragActive } = useUploadDropzone({
    onFilesSelected,
    maxFiles: 1,
    maxSize,
    accept,
    onError: handleError,
    onDropRejected: handleDropRejected,
  });

  // If no image, show dropzone
  if (!imageUrl) {
    return (
      <div className="flex flex-col gap-2">
        <div
          {...getRootProps()}
          className={cn(
            "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-input bg-background px-3 py-8 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
            isDragActive && "border-primary bg-primary/10",
            fileSizeError && "border-destructive",
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="flex w-full max-w-[306px] flex-col items-center gap-2">
            <p className="text-center text-sm font-medium leading-none text-muted-foreground">
              Drop your image
            </p>
            <p className="whitespace-pre-wrap text-center text-xs leading-4 text-muted-foreground-2">
              JPG, JPEG, PNG and WEBP.{"\n"} Max{" "}
              {Math.round(maxSize / (1024 * 1024))} MB.
            </p>
          </div>
          <div className="flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 pointer-events-none">
            <Upload className="size-4 text-primary" />
            <span className="text-sm font-medium leading-5 text-foreground">
              Choose Image
            </span>
          </div>
        </div>
        {fileSizeError && (
          <p className="text-sm text-destructive">Image is too large</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col items-start justify-end overflow-hidden rounded-xl p-3",
        className
      )}
    >
      {/* Background image with gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl">
        <div className="absolute inset-0 rounded-xl bg-white" />
        {isImageLoading && !isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt="Uploaded"
          fill
          className="rounded-xl object-cover"
          onLoad={() => setIsImageLoading(false)}
          onLoadingComplete={() => setIsImageLoading(false)}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent from-[48%] to-foreground to-[89%]" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        {!isUploading && (
          <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        )}
      </div>

      {/* Content */}
      {!isUploading && (
        <div className="relative flex w-full flex-1 flex-col items-start justify-between">
          {/* Remove button (top right) */}
          <div className="flex w-full items-start justify-end">
            <button
              type="button"
              onClick={onRemove}
              className="group/remove flex size-8 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 ease-in-out hover:scale-110 hover:bg-primary hover:shadow-xl cursor-pointer"
            >
              <X className="size-5 text-foreground transition-colors duration-200 group-hover/remove:text-white" />
            </button>
          </div>

          {/* Change photo button (bottom) */}
          <button
            type="button"
            {...getRootProps()}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/20 px-3 py-2 backdrop-blur-sm transition-colors duration-200 ease-in-out hover:border-white/30 hover:bg-white/30 cursor-pointer"
          >
            <input {...getInputProps()} />
            <ImagePlus className="size-4 text-white" />
            <span className="text-sm font-medium leading-5 text-white">
              Change photo
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
