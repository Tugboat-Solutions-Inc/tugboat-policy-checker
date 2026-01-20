"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWithBoundingBoxesProps {
  imageUrl: string;
  boundingBoxes: number[] | null;
  alt?: string;
  className?: string;
  mode?: "single" | "permutations";
}

export function ImageWithBoundingBoxes({
  imageUrl,
  boundingBoxes,
  alt = "Image",
  className,
  mode = "single",
}: ImageWithBoundingBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

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

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  let boundingBoxElement: React.ReactNode = null;

  if (imageSize && containerSize.width > 0 && containerSize.height > 0 && boundingBoxes && boundingBoxes.length === 4) {
    const cw = containerSize.width;
    const ch = containerSize.height;

    const iw = imageSize.width;
    const ih = imageSize.height;

    const scale = (cw / iw < ch / ih) ? cw / iw : ch / ih;

    const renderedWidth = iw * scale;
    const renderedHeight = ih * scale;

    const offsetX = (cw - renderedWidth) / 2;
    const offsetY = (ch - renderedHeight) / 2;

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(v, max));

    const makeBox = (opts: {
      xMin: number;
      xMax: number;
      yMin: number;
      yMax: number;
      color: string;
      zIndex: number;
    }) => {
      const x1 = Math.min(opts.xMin, opts.xMax);
      const x2 = Math.max(opts.xMin, opts.xMax);
      const y1 = Math.min(opts.yMin, opts.yMax);
      const y2 = Math.max(opts.yMin, opts.yMax);

      const clampedX1 = clamp(x1, 0, iw);
      const clampedX2 = clamp(x2, 0, iw);
      const clampedY1 = clamp(y1, 0, ih);
      const clampedY2 = clamp(y2, 0, ih);

      let left = offsetX + clampedX1 * scale;
      let top = offsetY + clampedY1 * scale;
      let width = (clampedX2 - clampedX1) * scale;
      let height = (clampedY2 - clampedY1) * scale;

      left = Math.max(offsetX, left);
      top = Math.max(offsetY, top);

      if (left + width > offsetX + renderedWidth) {
        width = offsetX + renderedWidth - left;
      }
      if (top + height > offsetY + renderedHeight) {
        height = offsetY + renderedHeight - top;
      }

      if (width <= 0 || height <= 0) return null;

      return (
        <div
          key={`${opts.color}-${opts.zIndex}`}
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: `2px solid ${opts.color}`,
            pointerEvents: "none",
            zIndex: opts.zIndex,
            boxSizing: "border-box",
          }}
        />
      );
    };

    const b0 = boundingBoxes[0];
    const b1 = boundingBoxes[1];
    const b2 = boundingBoxes[2];
    const b3 = boundingBoxes[3];

    if (mode === "permutations") {
      const boxes = [
        makeBox({
          color: "#ef4444",
          zIndex: 10,
          xMin: iw - b3,
          xMax: iw - b1,
          yMin: b0,
          yMax: b2,
        }),
        makeBox({
          color: "#22c55e",
          zIndex: 11,
          xMin: b1,
          xMax: b3,
          yMin: b0,
          yMax: b2,
        }),
        makeBox({
          color: "#3b82f6",
          zIndex: 12,
          xMin: b0,
          xMax: b2,
          yMin: b1,
          yMax: b3,
        }),
        makeBox({
          color: "#eab308",
          zIndex: 13,
          xMin: iw - b2,
          xMax: iw - b0,
          yMin: b1,
          yMax: b3,
        }),
        makeBox({
          color: "#a855f7",
          zIndex: 14,
          xMin: b0,
          xMax: b1,
          yMin: b2,
          yMax: b3,
        }),
      ].filter(Boolean);

      boundingBoxElement = <>{boxes}</>;
    } else {
      boundingBoxElement = makeBox({
        color: "#ef4444",
        zIndex: 10,
        xMin: iw - b3,
        xMax: iw - b1,
        yMin: b0,
        yMax: b2,
      });
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
        className="object-contain"
        onLoadingComplete={handleImageLoad}
        priority
      />
      {boundingBoxElement}
    </div>
  );
}
