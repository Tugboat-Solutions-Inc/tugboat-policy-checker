"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DEBUG = false;

interface ImageWithBoundingBoxesProps {
  imageUrl: string;
  boundingBoxes: number[] | null;
  alt?: string;
  className?: string;
}

type DetectionMethod = "client-bitmap" | "api-exifr" | "heuristic" | "none";

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
  const [exifOrientation, setExifOrientation] = useState(1);
  const [exifChecked, setExifChecked] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>("none");
  const [rawBitmapSize, setRawBitmapSize] = useState<{ width: number; height: number } | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Reset state when the image URL changes
  useEffect(() => {
    setExifOrientation(1);
    setExifChecked(false);
    setImageSize(null);
    setDetectionMethod("none");
    setRawBitmapSize(null);
    setDetectionError(null);
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
    async (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const displayW = img.naturalWidth;
      const displayH = img.naturalHeight;
      setImageSize({ width: displayW, height: displayH });

      const currentSrc = img.src;

      // Try 1: client-side createImageBitmap (fast, needs CORS)
      try {
        const res = await fetch(currentSrc);
        const blob = await res.blob();
        const rawBitmap = await createImageBitmap(blob, {
          imageOrientation: "none",
        });
        const rawW = rawBitmap.width;
        const rawH = rawBitmap.height;
        rawBitmap.close();
        setRawBitmapSize({ width: rawW, height: rawH });

        if (rawW !== displayW || rawH !== displayH) {
          // Dimensions swapped → 90° or 270° rotation
          // Can't distinguish 6 vs 8 from dimensions alone,
          // fall through to API for exact orientation
          try {
            const apiRes = await fetch(
              `/api/image-orientation?url=${encodeURIComponent(currentSrc)}`
            );
            const data = await apiRes.json();
            setExifOrientation(data.orientation ?? 6);
            setDetectionMethod("api-exifr");
          } catch {
            // API failed, assume 90° CW (most common)
            setExifOrientation(6);
            setDetectionMethod("client-bitmap");
          }
        } else {
          // Same dimensions — could be orientation 1 (none) or 3 (180°)
          // Check via API to catch 180° rotation
          try {
            const apiRes = await fetch(
              `/api/image-orientation?url=${encodeURIComponent(currentSrc)}`
            );
            const data = await apiRes.json();
            setExifOrientation(data.orientation ?? 1);
            setDetectionMethod("api-exifr");
          } catch {
            setExifOrientation(1);
            setDetectionMethod("client-bitmap");
          }
        }
        setDetectionError(null);
      } catch (err) {
        // CORS blocked — fall back to server-side API route
        setDetectionError(`Client fetch failed: ${err instanceof Error ? err.message : "unknown"}`);
        try {
          const apiRes = await fetch(
            `/api/image-orientation?url=${encodeURIComponent(currentSrc)}`
          );
          const data = await apiRes.json();
          setExifOrientation(data.orientation ?? 1);
          setDetectionMethod("api-exifr");
          if (data.error) {
            setDetectionError(prev => `${prev} | API: ${data.error}`);
          }
        } catch (apiErr) {
          setDetectionError(prev => `${prev} | API also failed: ${apiErr instanceof Error ? apiErr.message : "unknown"}`);
          setExifOrientation(1);
          setDetectionMethod("none");
        }
      } finally {
        setExifChecked(true);
      }
    },
    []
  );

  let boundingBoxElement: React.ReactNode = null;
  let debugTransformed: { x1: number; y1: number; x2: number; y2: number } | null = null;
  let debugOrientation = 1;

  if (imageSize && exifChecked && containerSize.width > 0 && containerSize.height > 0 && boundingBoxes && boundingBoxes.length === 4) {
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

    // Backend stores bbox as [x_min, y_min, x_max, y_max] in raw pixel space.
    let x1 = boundingBoxes[0];
    let y1 = boundingBoxes[1];
    let x2 = boundingBoxes[2];
    let y2 = boundingBoxes[3];

    // Determine effective orientation with heuristic fallback
    let orientation = exifOrientation;
    if (orientation === 1) {
      const maxBboxX = Math.max(x1, x2);
      const maxBboxY = Math.max(y1, y2);
      if (maxBboxX > iw * 1.01 || maxBboxY > ih * 1.01) {
        orientation = 6; // heuristic: assume 90° CW
      }
    }
    debugOrientation = orientation;

    if (orientation === 6) {
      // 90° CW: display_x = rawH - raw_y, display_y = raw_x
      const dw = iw;
      x1 = dw - boundingBoxes[3];
      y1 = boundingBoxes[0];
      x2 = dw - boundingBoxes[1];
      y2 = boundingBoxes[2];
    } else if (orientation === 8) {
      // 270° CW: display_x = raw_y, display_y = rawW - raw_x
      const dh = ih;
      x1 = boundingBoxes[1];
      y1 = dh - boundingBoxes[2];
      x2 = boundingBoxes[3];
      y2 = dh - boundingBoxes[0];
    } else if (orientation === 3) {
      // 180°: display_x = rawW - raw_x, display_y = rawH - raw_y
      x1 = iw - boundingBoxes[2];
      y1 = ih - boundingBoxes[3];
      x2 = iw - boundingBoxes[0];
      y2 = ih - boundingBoxes[1];
    }

    debugTransformed = { x1, y1, x2, y2 };

    boundingBoxElement = makeBox({
      color: "#ef4444",
      zIndex: 10,
      xMin: x1,
      xMax: x2,
      yMin: y1,
      yMax: y2,
    });
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

      {DEBUG && (
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            right: 4,
            background: "rgba(0,0,0,0.85)",
            color: "#0f0",
            fontSize: 11,
            fontFamily: "monospace",
            padding: 8,
            zIndex: 50,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: "50%",
            overflow: "auto",
            borderRadius: 4,
          }}
        >
          {[
            `EXIF orientation: ${exifOrientation} (effective: ${debugOrientation})`,
            `Detection method: ${detectionMethod}`,
            `Display (naturalW×H): ${imageSize?.width ?? "?"}×${imageSize?.height ?? "?"}`,
            `Raw bitmap (W×H): ${rawBitmapSize ? `${rawBitmapSize.width}×${rawBitmapSize.height}` : "N/A (CORS?)"}`,
            `Container: ${containerSize.width}×${containerSize.height}`,
            `Raw bbox [x_min, y_min, x_max, y_max]: [${boundingBoxes?.join(", ") ?? "null"}]`,
            debugTransformed
              ? `Transformed bbox: [${debugTransformed.x1.toFixed(1)}, ${debugTransformed.y1.toFixed(1)}, ${debugTransformed.x2.toFixed(1)}, ${debugTransformed.y2.toFixed(1)}]`
              : `Transformed bbox: (not computed)`,
            `exifChecked: ${exifChecked}`,
            detectionError ? `Errors: ${detectionError}` : null,
            `Image src: ${imageUrl.substring(imageUrl.lastIndexOf("/") + 1)}`,
          ]
            .filter(Boolean)
            .join("\n")}
        </div>
      )}
    </div>
  );
}
