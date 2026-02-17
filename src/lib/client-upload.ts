import { createClient } from "@/utils/supabase/client";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";
import { API_ENDPOINTS } from "@/config/api";
import { createUpload } from "@/features/collection-details/api/upload.actions";
import { startUploadProcessing } from "@/features/collection-details/api/upload.actions";
import { startDeduplication } from "@/features/collection-details/api/collection.actions";
import type { ActionResult } from "@/lib/fetch-with-auth";
import { useUploadProgressStore } from "@/stores/upload-progress-store";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const SKIP_COMPRESSION_THRESHOLD = 200 * 1024;

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

async function clientMultipartUpload(
  url: string,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };

    const impersonatedUserId = await getImpersonationHeader();
    if (impersonatedUserId) {
      headers["TB-IMA-Impersonated-User"] = impersonatedUserId;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return { success: false, message: `Photo upload failed: ${errorText}` };
    }

    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Photo upload failed",
    };
  }
}

const MAX_BATCH_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BATCH_FILE_COUNT = 10;

function splitIntoBatches(photos: Blob[]): Blob[][] {
  const batches: Blob[][] = [];
  let currentBatch: Blob[] = [];
  let currentSize = 0;

  for (const photo of photos) {
    if (
      currentBatch.length > 0 &&
      (currentSize + photo.size > MAX_BATCH_SIZE_BYTES ||
        currentBatch.length >= MAX_BATCH_FILE_COUNT)
    ) {
      batches.push(currentBatch);
      currentBatch = [];
      currentSize = 0;
    }
    currentBatch.push(photo);
    currentSize += photo.size;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

async function deduplicatePhotos(photos: Blob[]): Promise<Blob[]> {
  const seen = new Set<string>();
  const unique: Blob[] = [];

  for (const photo of photos) {
    const buffer = await photo.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!seen.has(hash)) {
      seen.add(hash);
      unique.push(photo);
    }
  }

  return unique;
}

async function addPhotosToUpload(
  propertyId: string,
  unitId: string,
  collectionId: string,
  uploadId: string,
  compressedPhotos: Blob[]
): Promise<ActionResult<null>> {
  const url = API_ENDPOINTS.PROPERTIES.UPLOADS_PHOTOS(
    propertyId,
    unitId,
    collectionId,
    uploadId
  );

  const uniquePhotos = await deduplicatePhotos(compressedPhotos);
  const batches = splitIntoBatches(uniquePhotos);

  for (let b = 0; b < batches.length; b++) {
    const formData = new FormData();
    for (let i = 0; i < batches[b].length; i++) {
      formData.append("photos", batches[b][i], `photo-${b}-${i}.jpg`);
    }

    const result = await clientMultipartUpload(url, formData);
    if (!result.success) {
      const isAlreadyAttached = result.message?.includes("already attached");
      if (!isAlreadyAttached) {
        return result;
      }
    }
  }

  return { success: true, data: null };
}

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

  const progressStore = useUploadProgressStore.getState();
  progressStore.startUpload(files.length);

  try {
    const createResult = await createUpload(collectionId, unitId, propertyId, {
      notes,
    });

    if (!createResult.success) {
      return { success: false, successCount: 0, failedBatches: [0] };
    }

    const uploadId = createResult.data.id;

    const compressedPhotos: Blob[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i]);
      compressedPhotos.push(compressed);

      useUploadProgressStore.getState().setProgress(i + 1, files.length);

      onProgress?.({
        completed: i + 1,
        total: files.length,
        batchIndex: 0,
        totalBatches: 1,
      });
    }

    const photosResult = await addPhotosToUpload(
      propertyId,
      unitId,
      collectionId,
      uploadId,
      compressedPhotos
    );

    if (!photosResult.success) {
      return {
        success: false,
        successCount: 0,
        failedBatches: [0],
      };
    }

    const startResult = await startUploadProcessing(
      propertyId,
      unitId,
      collectionId,
      uploadId
    );

    if (!startResult.success) {
      return { success: false, successCount: 0, failedBatches: [0] };
    }

    startDeduplication(propertyId, unitId, collectionId);

    return {
      success: true,
      successCount: files.length,
      failedBatches: [],
    };
  } finally {
    useUploadProgressStore.getState().finishUpload();
  }
}
