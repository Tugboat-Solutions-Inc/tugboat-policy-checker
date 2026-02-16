import { createClient } from "@/utils/supabase/client";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";
import { API_ENDPOINTS } from "@/config/api";
import { startDeduplication } from "@/features/collection-details/api/collection.actions";
import type { ActionResult } from "@/lib/fetch-with-auth";
import { useUploadProgressStore } from "@/stores/upload-progress-store";

// --- Image Compression ---

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const SKIP_COMPRESSION_THRESHOLD = 200 * 1024; // 200KB

export async function compressImage(file: File): Promise<Blob> {
  if (file.size <= SKIP_COMPRESSION_THRESHOLD) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let targetWidth = width;
  let targetHeight = height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      targetWidth = MAX_DIMENSION;
      targetHeight = Math.round(height * (MAX_DIMENSION / width));
    } else {
      targetHeight = MAX_DIMENSION;
      targetWidth = Math.round(width * (MAX_DIMENSION / height));
    }
  }

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();
      return canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

// --- Blob to Base64 ---

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Marker = "base64,";
      const idx = result.indexOf(base64Marker);
      if (idx === -1) {
        reject(new Error("Failed to convert blob to base64"));
        return;
      }
      resolve(result.substring(idx + base64Marker.length));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// --- Client-side Authenticated Fetch ---

let cachedImpersonatedUserId: string | null | undefined;

async function getImpersonationHeader(): Promise<string | null> {
  if (cachedImpersonatedUserId === undefined) {
    cachedImpersonatedUserId = await getImpersonatedUserId();
  }
  return cachedImpersonatedUserId;
}

export async function clientFetchWithAuth<T>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<ActionResult<T>> {
  const { method = "GET", body } = options;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const impersonatedUserId = await getImpersonationHeader();
    if (impersonatedUserId) {
      headers["TB-IMA-Impersonated-User"] = impersonatedUserId;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return { success: false, message: `Upload failed: ${errorText}` };
    }

    if (response.status === 204) {
      return { success: true, data: null as T };
    }

    const text = await response.text();
    if (!text) {
      return { success: true, data: null as T };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// --- Upload ---

export type BatchUploadProgress = {
  completed: number;
  total: number;
  batchIndex: number;
  totalBatches: number;
};

export type BatchUploadConfig = {
  collectionId: string;
  unitId: string;
  propertyId: string;
  notes: string;
  onProgress?: (progress: BatchUploadProgress) => void;
};

export type BatchUploadResult = {
  success: boolean;
  successCount: number;
  failedBatches: number[];
};

export async function uploadPhotosInBatches(
  files: File[],
  config: BatchUploadConfig
): Promise<BatchUploadResult> {
  const { collectionId, unitId, propertyId, notes, onProgress } = config;
  const url = API_ENDPOINTS.PROPERTIES.UPLOADS(propertyId, unitId, collectionId);

  const progressStore = useUploadProgressStore.getState();
  progressStore.startUpload(files.length);

  try {
    // Compress and convert each image sequentially to limit memory
    const photosB64: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i]);
      const base64 = await blobToBase64(compressed);
      photosB64.push(base64);

      useUploadProgressStore.getState().setProgress(i + 1, files.length);

      onProgress?.({
        completed: i + 1,
        total: files.length,
        batchIndex: 0,
        totalBatches: 1,
      });
    }

    const result = await clientFetchWithAuth(url, {
      method: "POST",
      body: {
        notes,
        photos_b64: photosB64,
      },
    });

    if (result.success) {
      startDeduplication(propertyId, unitId, collectionId);
    }

    return {
      success: result.success,
      successCount: result.success ? files.length : 0,
      failedBatches: result.success ? [] : [0],
    };
  } finally {
    useUploadProgressStore.getState().finishUpload();
  }
}
