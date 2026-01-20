import { env } from "@/lib/env";

const TUGBOAT_PRIMARY_COLOR = "1597b4";

export function getBunnyEmbedUrl(bunnyVideoId: string | undefined): string | null {
  if (!bunnyVideoId) return null;
  const libraryId = env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
  const params = new URLSearchParams({
    autoplay: "true",
    preload: "true",
    responsive: "true",
    primaryColor: TUGBOAT_PRIMARY_COLOR,
  });
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}?${params}`;
}
