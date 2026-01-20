"use client";

import { X, ImageIcon } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

interface ViewPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: { url: string; name?: string } | null;
}

export function ViewPhotoDialog({
  open,
  onOpenChange,
  photo,
}: ViewPhotoDialogProps) {
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Keep overlay behind the dialog content so blur never overlays the image */}
        <DialogOverlay
          className="fixed inset-0 z-40 backdrop-blur-md"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
        />

        <DialogContent
          showCloseButton={false}
          className="z-50 w-fit min-w-[400px] max-w-[1400px] gap-4 rounded-lg border border-accent-border bg-white p-3 flex flex-col"
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-medium leading-none">
              {photo.name || "Photo"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {photo.url ? (
              <Image
                src={photo.url}
                alt={photo.name || "Photo"}
                width={1600}
                height={1200}
                sizes="1200px"
                className="block w-auto h-auto min-w-[300px] max-w-[1376px] min-h-[300px] max-h-[800px] object-contain"
                priority
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-10">
                <ImageIcon className="size-16 text-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">
                  Photo not available
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
