"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  Video,
  InitVideoUploadResponse,
} from "../types/video.types";

export async function getVideos(
  propertyId: string,
  unitId: string,
  collectionId: string
): Promise<ActionResult<Video[]>> {
  return fetchWithAuth<Video[]>(
    `${API_ENDPOINTS.PROPERTIES.VIDEOS(propertyId, unitId, collectionId)}?t=${Date.now()}`,
    {
      errorPrefix: "Failed to fetch videos",
      cache: "no-store",
    }
  );
}

export async function initVideoUpload(
  propertyId: string,
  unitId: string,
  collectionId: string,
  title: string
): Promise<ActionResult<InitVideoUploadResponse>> {
  return fetchWithAuth<InitVideoUploadResponse>(
    API_ENDPOINTS.PROPERTIES.VIDEOS_INIT(propertyId, unitId, collectionId),
    {
      method: "POST",
      body: { title },
      errorPrefix: "Failed to initialize video upload",
    }
  );
}

export async function deleteVideo(
  propertyId: string,
  unitId: string,
  collectionId: string,
  videoId: string
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.VIDEOS_DELETE(
      propertyId,
      unitId,
      collectionId,
      videoId
    ),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete video",
    }
  );
}

export async function getVideo(
  propertyId: string,
  unitId: string,
  collectionId: string,
  videoId: string
): Promise<ActionResult<Video | null>> {
  const result = await fetchWithAuth<Video[]>(
    `${API_ENDPOINTS.PROPERTIES.VIDEOS(propertyId, unitId, collectionId)}?t=${Date.now()}`,
    {
      errorPrefix: "Failed to fetch videos",
      cache: "no-store",
    }
  );

  if (!result.success) {
    return result;
  }

  const video =
    result.data?.find(
      (v) => v.id === videoId || v.bunny_video_id === videoId
    ) ?? null;
  return { success: true, data: video };
}
