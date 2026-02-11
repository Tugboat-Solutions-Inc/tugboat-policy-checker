"use client";

import { Loader2Icon } from "lucide-react";
import { useUploadProgressStore } from "@/stores/upload-progress-store";

export function UploadProgressPill() {
  const { isUploading, completed, total } = useUploadProgressStore();

  if (!isUploading) return null;

  return (
    <div className="flex items-center gap-3 bg-primary/10 rounded-[10px] px-4 py-3 w-full mt-2.5 mb-0.5">
      <Loader2Icon size={20} className="text-primary animate-spin shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <p className="font-semibold text-base text-foreground leading-none">
          Uploading {completed}/{total} photos
        </p>
        <p className="text-sm text-muted-foreground leading-none">
          We're detecting items from your photos. This may take some time — please refresh after a few moments.
        </p>
      </div>
    </div>
  );
}
