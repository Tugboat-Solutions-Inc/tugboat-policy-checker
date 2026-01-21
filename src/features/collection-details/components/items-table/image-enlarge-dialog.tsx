"use client";

import { X, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { ImageWithBoundingBoxes } from "@/components/common/image-with-bounding-boxes";

interface ImageEnlargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  boundingBoxes?: number[] | null;
  alt?: string;
}

export function ImageEnlargeDialog({
  open,
  onOpenChange,
  imageUrl,
  boundingBoxes,
  alt = "Item image",
}: ImageEnlargeDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[5px]"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        />
        <DialogContent
          showCloseButton={false}
          className="w-[85vw] max-w-[1400px] h-[85vh] max-h-[900px] gap-4 rounded-lg border border-accent-border bg-white p-4 flex flex-col"
        >
          <DialogHeader className="flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-base font-medium leading-none">
              {alt}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="relative flex-1 min-h-0 rounded-md overflow-hidden bg-muted">
            {imageUrl ? (
              <ImageWithBoundingBoxes
                imageUrl={imageUrl}
                boundingBoxes={boundingBoxes || null}
                alt={alt}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="size-16 text-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">
                  Image not available
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
