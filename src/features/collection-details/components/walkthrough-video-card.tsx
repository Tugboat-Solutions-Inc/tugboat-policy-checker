"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Video, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalkthroughVideo } from "../types/collection-details.types";

export type VideoCardProps = {
  video: WalkthroughVideo;
  isEditMode?: boolean;
  onRemove?: (id: string) => void;
  onClick?: () => void;
};

export function VideoCard({
  video,
  isEditMode,
  onRemove,
  onClick,
}: VideoCardProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !video.thumbnailUrl || hasError;

  const handleClick = () => {
    if (!isEditMode) {
      onClick?.();
    }
  };

  return (
    <div
      className="relative w-full aspect-video rounded-md overflow-hidden group cursor-pointer bg-muted"
      onClick={handleClick}
    >
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="size-12 text-muted-foreground/50" />
        </div>
      ) : (
        <Image
          src={video.thumbnailUrl}
          alt="Video thumbnail"
          fill
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {isEditMode ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(video.id);
          }}
          className="absolute top-3 right-3 size-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors z-20"
        >
          <X className="size-5 text-foreground" />
        </button>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="size-3.5 text-white fill-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-muted-foreground px-1 py-0.5 rounded-md">
            <span className="text-sm font-medium text-white leading-none">
              {video.duration}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function VideoCardSkeleton() {
  return <Skeleton className="w-full aspect-video rounded-md" />;
}

