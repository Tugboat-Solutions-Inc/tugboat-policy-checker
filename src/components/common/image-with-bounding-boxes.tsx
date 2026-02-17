"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWithBoundingBoxesProps {
  imageUrl: string;
  boundingBoxes: number[] | null;
  alt?: string;
  className?: string;
}

export function ImageWithBoundingBoxes({
  imageUrl,
  boundingBoxes,
  alt = "Image",
  className,
}: ImageWithBoundingBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setImageSize(null);
  }, [imageUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    },
    []
  );

  let boundingBoxElement: React.ReactNode = null;

  if (
    imageSize &&
    containerSize.width > 0 &&
    containerSize.height > 0 &&
    boundingBoxes &&
    boundingBoxes.length === 4
  ) {
    const cw = containerSize.width;
    const ch = containerSize.height;
    const iw = imageSize.width;
    const ih = imageSize.height;

    const scale = cw / iw < ch / ih ? cw / iw : ch / ih;
    const renderedWidth = iw * scale;
    const renderedHeight = ih * scale;
    const offsetX = (cw - renderedWidth) / 2;
    const offsetY = (ch - renderedHeight) / 2;

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(v, max));

    const x1 = clamp(Math.min(boundingBoxes[0], boundingBoxes[1]), 0, iw);
    const x2 = clamp(Math.max(boundingBoxes[0], boundingBoxes[1]), 0, iw);
    const y1 = clamp(Math.min(boundingBoxes[2], boundingBoxes[3]), 0, ih);
    const y2 = clamp(Math.max(boundingBoxes[2], boundingBoxes[3]), 0, ih);

    let left = offsetX + x1 * scale;
    let top = offsetY + y1 * scale;
    let width = (x2 - x1) * scale;
    let height = (y2 - y1) * scale;

    left = Math.max(offsetX, left);
    top = Math.max(offsetY, top);

    if (left + width > offsetX + renderedWidth) {
      width = offsetX + renderedWidth - left;
    }
    if (top + height > offsetY + renderedHeight) {
      height = offsetY + renderedHeight - top;
    }

    if (width > 0 && height > 0) {
      boundingBoxElement = (
        <div
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: "2px solid #ef4444",
            pointerEvents: "none",
            zIndex: 10,
            boxSizing: "border-box",
          }}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized
        className="object-contain"
        onLoad={handleImageLoad}
        priority
      />
      {boundingBoxElement}
    </div>
  );
}
