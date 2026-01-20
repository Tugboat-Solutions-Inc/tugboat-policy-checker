"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadVideoDropzone } from "./hooks/use-upload-video-dropzone";
import { toast } from "@/components/common/toast/toast";
import { FileRejection } from "react-dropzone";

interface UploadVideoDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  onError?: (error: Error) => void;
  onDropRejected?: (fileRejections: FileRejection[]) => void;
}

function getReadableError(code: string, maxSize: number): string {
  switch (code) {
    case "file-invalid-type":
      return "Invalid file type. Please upload MP4 or MOV videos.";
    case "file-too-large":
      return `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`;
    case "too-many-files":
      return "Too many files selected.";
    default:
      return "File could not be uploaded.";
  }
}

export function UploadVideoDropzone({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 500 * 1024 * 1024,
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
  },
  className,
  onError,
  onDropRejected,
}: UploadVideoDropzoneProps) {
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

  const { getRootProps, getInputProps, isDragActive } = useUploadVideoDropzone({
    onFilesSelected,
    maxFiles,
    maxSize,
    accept,
    onError,
    onDropRejected: handleDropRejected,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-input bg-background px-3 py-8 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/10",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background p-3 pointer-events-none">
        <Upload className="size-4 text-primary" />
      </div>
      <div className="flex max-w-[316px] flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium leading-none text-muted-foreground">
          Drag & drop a walkthrough video or click to select
        </p>
        <p className="whitespace-pre-wrap text-xs leading-4 text-muted-foreground-2">
          Upload up to {maxFiles} videos of the items in this collection.
          {"\n"}
          MP4 or MOV. Max {Math.round(maxSize / (1024 * 1024))} MB.
        </p>
      </div>
    </div>
  );
}
