import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import exifr from "exifr";

/**
 * Returns the EXIF orientation (1–8) for a given image URL.
 * Server-side fetch bypasses browser CORS restrictions.
 * Only allows URLs from the configured storage CDN.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ orientation: 1, method: "no-url" });
  }

  // Only allow fetching from our storage CDN to prevent SSRF
  const storageOrigin = new URL(env.NEXT_PUBLIC_STORAGE_URL).origin;
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ orientation: 1, method: "bad-url" });
  }
  if (parsedUrl.origin !== storageOrigin) {
    return NextResponse.json({ orientation: 1, method: "wrong-origin" });
  }

  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const orientation = await exifr.orientation(buffer);

    return NextResponse.json(
      { orientation: orientation ?? 1, method: "exifr" },
      { headers: { "Cache-Control": "public, max-age=86400, immutable" } }
    );
  } catch (err) {
    return NextResponse.json({
      orientation: 1,
      method: "error",
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
