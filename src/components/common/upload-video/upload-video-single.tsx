"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadVideoDropzone } from "./upload-video-dropzone";
import { useUploadVideoDropzone } from "./hooks/use-upload-video-dropzone";
import { useVideoDuration, formatDuration } from "./hooks/use-video-duration";
import { toast } from "@/components/common/toast/toast";

interface UploadVideoSingleProps {
  videoUrl?: string | null;
  onRemove: () => void;
  onFilesSelected: (files: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

export function UploadVideoSingle({
  videoUrl,
  onRemove,
  onFilesSelected,
  maxSize = 500 * 1024 * 1024,
  accept = {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/webm": [".webm"],
  },
  className,
}: UploadVideoSingleProps) {
  const duration = useVideoDuration(videoUrl);

  const handleError = React.useCallback((error: Error) => {
    toast.error(
      "Upload Error",
      error.message || "An error occurred during file upload"
    );
  }, []);

  const handleDropRejected = React.useCallback((fileRejections: any[]) => {
    toast.error("Incorrect File Type");
  }, []);

  const { getRootProps, getInputProps } = useUploadVideoDropzone({
    onFilesSelected,
    maxFiles: 1,
    maxSize,
    accept,
    onError: handleError,
    onDropRejected: handleDropRejected,
  });

  if (!videoUrl) {
    return (
      <UploadVideoDropzone
        onFilesSelected={onFilesSelected}
        maxFiles={1}
        maxSize={maxSize}
        accept={accept}
        className={className}
        onError={handleError}
        onDropRejected={handleDropRejected}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="group relative aspect-video w-full overflow-hidden rounded-lg">
        <video
          src={videoUrl}
          controls
          className="h-full w-full object-cover"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
        {duration !== null && (
          <div className="absolute bottom-3 right-3 rounded-[6px] bg-muted-foreground flex items-center h-[22px] p-1">
            <span className="text-sm font-medium text-white">
              {formatDuration(duration)}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:opacity-100 cursor-pointer z-10"
        >
          <X className="size-5 text-foreground" />
        </button>
      </div>

      <button
        type="button"
        {...getRootProps()}
        className="flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
      >
        <input {...getInputProps()} />
        <Upload className="size-4 text-primary" />
        <span className="text-sm font-medium leading-5 text-foreground">
          Replace Video
        </span>
      </button>
    </div>
  );
}
