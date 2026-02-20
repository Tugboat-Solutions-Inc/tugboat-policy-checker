"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
      const rect = container.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height,
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

  const cw = containerSize.width;
  const ch = containerSize.height;
  const iw = imageSize?.width ?? 0;
  const ih = imageSize?.height ?? 0;
  const hasLayout = iw > 0 && ih > 0 && cw > 0 && ch > 0;

  const scale = hasLayout ? Math.min(cw / iw, ch / ih) : 1;
  const renderedWidth = hasLayout ? iw * scale : 0;
  const renderedHeight = hasLayout ? ih * scale : 0;
  const offsetX = hasLayout ? (cw - renderedWidth) / 2 : 0;
  const offsetY = hasLayout ? (ch - renderedHeight) / 2 : 0;

  let boundingBoxElement: React.ReactNode = null;

  if (hasLayout && boundingBoxes && boundingBoxes.length === 4) {
    const xMin = boundingBoxes[0];
    const xMax = boundingBoxes[1];
    const yMin = boundingBoxes[2];
    const yMax = boundingBoxes[3];

    const left = offsetX + xMin * scale;
    const top = offsetY + yMin * scale;
    const width = (xMax - xMin) * scale;
    const height = (yMax - yMin) * scale;

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
      {/* Single img element — avoids unmount/remount flicker when hasLayout changes */}
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleImageLoad}
        style={
          hasLayout
            ? {
                position: "absolute",
                left: offsetX,
                top: offsetY,
                width: renderedWidth,
                height: renderedHeight,
              }
            : {
                width: "100%",
                height: "100%",
                objectFit: "contain" as const,
              }
        }
      />
      {boundingBoxElement}
    </div>
  );
}
