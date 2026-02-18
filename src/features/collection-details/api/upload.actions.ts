"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  CreateUploadData,
  GetUploadResponse,
  Upload,
} from "../types/upload.types";

export async function revalidateDashboardProperty(
  propertyId: string
): Promise<void> {
  revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId), "layout");
}

export async function createUpload(
  collectionId: string,
  unitId: string,
  propertyId: string,
  data: CreateUploadData
): Promise<ActionResult<Upload>> {
  const result = await fetchWithAuth<Upload>(
    API_ENDPOINTS.PROPERTIES.UPLOADS(propertyId, unitId, collectionId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create upload",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId), "layout");
  }

  return result;
}

export async function getUploads(
  collectionId: string,
  unitId: string,
  propertyId: string,
  page?: number,
  limit?: number
): Promise<ActionResult<GetUploadResponse>> {
  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append("page", String(page));
  if (limit !== undefined) queryParams.append("limit", String(limit));

  const baseUrl = API_ENDPOINTS.PROPERTIES.UPLOADS(
    propertyId,
    unitId,
    collectionId
  );
  const url = queryParams.toString()
    ? `${baseUrl}?${queryParams.toString()}`
    : baseUrl;

  return fetchWithAuth<GetUploadResponse>(url, {
    errorPrefix: "Failed to fetch uploads",
  });
}

export async function updateUpload(
  propertyId: string,
  unitId: string,
  collectionId: string,
  uploadId: string,
  data: Partial<CreateUploadData>
): Promise<ActionResult<Upload>> {
  return fetchWithAuth<Upload>(
    API_ENDPOINTS.PROPERTIES.UPLOADS_UPDATE(
      propertyId,
      unitId,
      collectionId,
      uploadId
    ),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update upload",
    }
  );
}

export async function getUploadsByUnitId(
  propertyId: string,
  unitId: string,
  page?: number,
  limit?: number
): Promise<ActionResult<GetUploadResponse>> {
  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append("page", String(page));
  if (limit !== undefined) queryParams.append("limit", String(limit));

  const baseUrl = API_ENDPOINTS.PROPERTIES.UPLOADS_BY_UNIT(propertyId, unitId);
  const url = queryParams.toString()
    ? `${baseUrl}?${queryParams.toString()}`
    : baseUrl;

  return fetchWithAuth<GetUploadResponse>(url, {
    errorPrefix: "Failed to fetch uploads by unit",
  });
}

export async function startUploadProcessing(
  propertyId: string,
  unitId: string,
  collectionId: string,
  uploadId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.UPLOADS_START(
      propertyId,
      unitId,
      collectionId,
      uploadId
    ),
    {
      method: "POST",
      errorPrefix: "Failed to start upload processing",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId), "layout");
  }

  return result;
}

export async function retryUpload(
  propertyId: string,
  unitId: string,
  collectionId: string,
  uploadId: string
): Promise<ActionResult<null>> {
  const url = API_ENDPOINTS.PROPERTIES.UPLOADS_RETRY(
    propertyId,
    unitId,
    collectionId,
    uploadId
  );
  
  const result = await fetchWithAuth<null>(
    url,
    {
      method: "POST",
      errorPrefix: "Failed to retry upload",
    }
  );

  console.log("[retryUpload] Result:", result);

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId), "layout");
  }

  return result;
}
