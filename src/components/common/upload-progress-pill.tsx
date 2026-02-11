"use client";

import { Loader2Icon } from "lucide-react";
import { useUploadProgressStore } from "@/stores/upload-progress-store";

export function UploadProgressPill() {
  const { isUploading, completed, total } = useUploadProgressStore();

  if (!isUploading) return null;

  return (
    <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm border border-border">
      <Loader2Icon className="size-4 animate-spin" />
      <span>
        Uploading {completed}/{total} photos...
      </span>
    </div>
  );
}
