"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadDropzone } from "./hooks/use-upload-dropzone";
import { toast } from "@/components/common/toast/toast";
import { FileRejection } from "react-dropzone";

interface UploadImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
  isInsideSheet?: boolean;
}

function getReadableError(code: string, maxSize: number): string {
  switch (code) {
    case "file-invalid-type":
      return "Invalid file type. Please upload JPG, PNG, or WEBP images.";
    case "file-too-large":
      return `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`;
    case "too-many-files":
      return "Too many files selected.";
    default:
      return "File could not be uploaded.";
  }
}

export function UploadImageDropzone({
  onFilesSelected,
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
}: UploadImageDropzoneProps) {
  const handleDropRejected = (fileRejections: FileRejection[]) => {
    const uniqueErrors = new Set<string>();
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        uniqueErrors.add(getReadableError(error.code, maxSize));
      });
    });
    uniqueErrors.forEach((errorMessage) => {
      toast.error(errorMessage);
    });
    onDropRejected?.(fileRejections);
  };

  const { getRootProps, getInputProps, isDragActive } = useUploadDropzone({
    onFilesSelected,
    maxFiles,
    maxSize,
    accept,
    onError,
    onDropRejected: handleDropRejected,
  });

  return (
    <div>
      {isInsideSheet ? (
        <p className="text-sm font-medium leading-none text-foreground mb-2">
          Additional Photos
        </p>
      ) : (
        <p className="text-sm font-medium leading-none text-foreground mb-2">
          Add photos
        </p>
      )}
      <div
        {...getRootProps()}
        className={cn(
          "flex h-[500px] w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-input bg-background px-3 py-8 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10",
          isInsideSheet ? "h-[200px]" : "",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex w-full max-w-[306px] flex-col items-center gap-2">
          <p className="text-sm font-medium leading-none text-muted-foreground">
            Drag & drop photos or click to select
          </p>
          <p className="whitespace-pre-wrap text-center text-xs leading-4 text-muted-foreground-2">
            Upload up to {maxFiles} photos of the items in this collection.
            {"\n"}
            JPG, JPEG, PNG and WEBP. Max {Math.round(
              maxSize / (1024 * 1024)
            )}{" "}
            MB.
          </p>
        </div>
        <div className="flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 pointer-events-none">
          <Upload className="size-4 text-primary" />
          <span className="text-sm font-medium leading-5 text-foreground">
            Upload Photos
          </span>
        </div>
      </div>
    </div>
  );
}
