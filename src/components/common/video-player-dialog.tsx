"use client";

import { X, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { getBunnyEmbedUrl } from "@/features/collection-details/config/video-player.config";
import type { WalkthroughVideo } from "../../features/collection-details/types/collection-details.types";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: WalkthroughVideo | null;
}

export function VideoPlayerDialog({
  open,
  onOpenChange,
  video,
}: VideoPlayerDialogProps) {
  if (!video) return null;

  const embedUrl = getBunnyEmbedUrl(video.bunnyVideoId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        />
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[1304px] gap-4 rounded-lg border border-accent-border bg-white p-3 flex flex-col"
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-medium leading-none">
              {video.title}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Video className="size-16 text-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">
                  Video not available
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
