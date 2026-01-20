"use client";

import { Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface UploadingVideo {
  id: string;
  videoId?: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "thumbnail" | "complete" | "error";
}

interface UploadingVideoCardProps {
  upload: UploadingVideo;
  onCancel?: (id: string) => void;
}

export function UploadingVideoCard({
  upload,
  onCancel,
}: UploadingVideoCardProps) {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted border border-border">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        {upload.status === "uploading" && (
          <>
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 text-primary animate-spin" />
              <span className="text-sm font-medium text-foreground">
                Uploading...
              </span>
            </div>
            <div className="w-full max-w-[200px]">
              <Progress value={upload.progress} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(upload.progress)}%
            </span>
          </>
        )}
        {upload.status === "processing" && (
          <>
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-sm font-medium text-foreground text-center">
              Video is processing
            </span>
            <span className="text-xs text-muted-foreground text-center">
              This may take a few minutes
            </span>
          </>
        )}
        {upload.status === "thumbnail" && (
          <>
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-sm font-medium text-foreground text-center">
              Generating thumbnail
            </span>
          </>
        )}
        {upload.status === "error" && (
          <span className="text-sm font-medium text-destructive">
            Upload failed
          </span>
        )}
        <span className="text-xs text-muted-foreground truncate max-w-full">
          {upload.fileName}
        </span>
      </div>
      {(upload.status === "uploading" || upload.status === "error") && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(upload.id)}
          className="absolute top-3 right-3 size-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          <X className="size-5 text-foreground" />
        </button>
      )}
    </div>
  );
}
