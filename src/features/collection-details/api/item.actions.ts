"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
  getItemsResponse,
  ItemImage,
  AddItemImageInput,
} from "../types/item.types";

export async function createItem(
  propertyId: string,
  unitId: string,
  collectionId: string,
  data: CreateItemInput
): Promise<ActionResult<Item>> {
  const result = await fetchWithAuth<Item>(
    API_ENDPOINTS.PROPERTIES.ITEMS(propertyId, unitId, collectionId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create item",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function getItemById(
  itemId: string,
  propertyId: string,
  unitId: string,
  collectionId: string
): Promise<ActionResult<Item>> {
  return fetchWithAuth<Item>(
    API_ENDPOINTS.PROPERTIES.ITEMS_UPDATE(
      itemId,
      propertyId,
      unitId,
      collectionId
    ),
    {
      errorPrefix: "Failed to fetch item",
    }
  );
}

export type GetItemsParams = {
  limit?: number;
  page?: number;
  q?: string;
  brand?: string[];
  category?: string[];
  condition?: string[];
  minValue?: number;
  maxValue?: number;
};

export async function getItems(
  propertyId: string,
  unitId: string,
  collectionId: string,
  params?: GetItemsParams
): Promise<ActionResult<getItemsResponse>> {
  const baseUrl = `${API_ENDPOINTS.PROPERTIES.ITEMS(
    propertyId,
    unitId,
    collectionId
  )}/search`;

  const body = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
    q: params?.q?.trim() ?? "",
    brands: params?.brand ?? [],
    categories: params?.category ?? [],
    conditions: params?.condition ?? [],
    min_value: params?.minValue ?? 0,
    max_value: params?.maxValue ?? 9999999,
  };

  return fetchWithAuth<getItemsResponse>(baseUrl, {
    method: "POST",
    body,
    errorPrefix: "Failed to fetch items",
  });
}

export async function deleteItems(
  propertyId: string,
  unitId: string,
  collectionId: string,
  itemIds: string[]
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.ITEMS_DELETE(propertyId, unitId, collectionId),
    {
      method: "POST",
      body: { item_ids: itemIds },
      errorPrefix: "Failed to delete items",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function updateItem(
  itemId: string,
  propertyId: string,
  unitId: string,
  collectionId: string,
  data: UpdateItemInput
): Promise<ActionResult<Item>> {
  const result = await fetchWithAuth<Item>(
    API_ENDPOINTS.PROPERTIES.ITEMS_UPDATE(
      itemId,
      propertyId,
      unitId,
      collectionId
    ),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update item",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

// Additional photos

export async function addItemImage(
  itemId: string,
  propertyId: string,
  unitId: string,
  collectionId: string,
  data: AddItemImageInput
): Promise<ActionResult<ItemImage>> {
  return fetchWithAuth<ItemImage>(
    API_ENDPOINTS.PROPERTIES.ITEMS_IMAGES(
      itemId,
      propertyId,
      unitId,
      collectionId
    ),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to add item image",
    }
  );
}

export async function deleteItemImage(
  itemId: string,
  propertyId: string,
  unitId: string,
  collectionId: string,
  imageId: string
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.ITEMS_IMAGES_DELETE(
      itemId,
      propertyId,
      unitId,
      collectionId,
      imageId
    ),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete item image",
    }
  );
}

export async function getItemImages(
  itemId: string,
  propertyId: string,
  unitId: string,
  collectionId: string
): Promise<ActionResult<ItemImage[]>> {
  return fetchWithAuth<ItemImage[]>(
    API_ENDPOINTS.PROPERTIES.ITEMS_IMAGES(
      itemId,
      propertyId,
      unitId,
      collectionId
    ),
    {
      errorPrefix: "Failed to get item images",
    }
  );
}
