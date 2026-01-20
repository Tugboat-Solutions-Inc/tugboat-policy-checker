"use client";

import * as React from "react";

export function useVideoDuration(videoUrl: string | null | undefined) {
  const [duration, setDuration] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!videoUrl) {
      setDuration(null);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.src = videoUrl;

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.src = "";
    };
  }, [videoUrl]);

  return duration;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
