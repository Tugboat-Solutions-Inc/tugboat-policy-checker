"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  CreateCollectionData,
  Collection,
  GetCollectionsResponse,
} from "../types/collection.types";

export async function createCollection(
  propertyId: string,
  unitId: string,
  data: CreateCollectionData,
  options?: { skipRevalidation?: boolean }
): Promise<ActionResult<Collection>> {
  const result = await fetchWithAuth<Collection>(
    API_ENDPOINTS.PROPERTIES.COLLECTIONS(propertyId, unitId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create collection",
    }
  );

  if (result.success && !options?.skipRevalidation) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function getCollections(
  propertyId: string,
  unitId: string,
  page: number = 1,
  limit: number = 100
): Promise<ActionResult<GetCollectionsResponse>> {
  const result = await fetchWithAuth<GetCollectionsResponse>(
    `${API_ENDPOINTS.PROPERTIES.COLLECTIONS(propertyId, unitId)}/search`,
    {
      method: "POST",
      body: {
        page,
        limit,
      },
      errorPrefix: "Failed to fetch collections",
    }
  );


  return result;
}

export async function deleteCollection(
  propertyId: string,
  collectionId: string,
  unitId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.COLLECTIONS_UPDATE(
      propertyId,
      collectionId,
      unitId
    ),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete collection",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function updateCollection(
  propertyId: string,
  collectionId: string,
  unitId: string,
  data: Partial<CreateCollectionData>,
  options?: { skipRevalidation?: boolean }
): Promise<ActionResult<Collection>> {
  const result = await fetchWithAuth<Collection>(
    API_ENDPOINTS.PROPERTIES.COLLECTIONS_UPDATE(
      propertyId,
      collectionId,
      unitId
    ),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update collection",
    }
  );
  if (result.success && !options?.skipRevalidation) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
    revalidatePath(ROUTES.DASHBOARD.COLLECTION(propertyId, collectionId, unitId));
  }

  return result;
}

export async function getCollectionById(
  propertyId: string,
  collectionId: string,
  unitId: string
): Promise<ActionResult<Collection>> {
  return fetchWithAuth<Collection>(
    API_ENDPOINTS.PROPERTIES.COLLECTIONS_UPDATE(
      propertyId,
      collectionId,
      unitId
    ),
    {
      errorPrefix: "Failed to fetch collection",
    }
  );
}

export async function startDeduplication(
  propertyId: string,
  unitId: string,
  collectionId: string
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.DEDUPLICATE(propertyId, unitId, collectionId),
    {
      method: "POST",
      errorPrefix: "Failed to start deduplication",
    }
  );
}

export async function resolveDuplicationGroup(
  propertyId: string,
  unitId: string,
  collectionId: string,
  dupeGroupId: string,
  itemIdsToDelete: string[]
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.RESOLVE_DUPE_GROUP(
      propertyId,
      unitId,
      collectionId,
      dupeGroupId
    ),
    {
      method: "POST",
      body: itemIdsToDelete,
      errorPrefix: "Failed to resolve duplicates",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
    revalidatePath(ROUTES.DASHBOARD.COLLECTION(propertyId, collectionId, unitId));
  }

  return result;
}

export async function updateCollectionFavorite(
  propertyId: string,
  unitId: string,
  collectionId: string,
  favorite: boolean,
  options?: { skipRevalidation?: boolean }
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.COLLECTION_FAVORITE(
      propertyId,
      unitId,
      collectionId
    ),
    {
      method: "PUT",
      body: { favorite },
      errorPrefix: "Failed to update favorite",
    }
  );

  if (result.success && !options?.skipRevalidation) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
    revalidatePath(ROUTES.DASHBOARD.COLLECTION(propertyId, collectionId, unitId));
  }

  return result;
}
