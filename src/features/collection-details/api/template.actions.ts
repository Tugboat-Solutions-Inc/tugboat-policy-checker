"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";

export type TemplateCategory = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
};

export type TemplateItem = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: TemplateCategory | null;
};

export type TemplateCollection = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  items: TemplateItem[];
};

export type Template = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  collections: TemplateCollection[];
  categories: TemplateCategory[];
};

export type TemplateSearchParams = {
  page: number;
  limit: number;
  q?: string;
  collection_ids: string[];
  category_ids: string[];
};

export type TemplateSearchItem = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: TemplateCategory | null;
  collection: {
    id: string;
    name: string;
  } | null;
};

export type TemplateSearchResponse = {
  data: TemplateSearchItem[];
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
};

export async function getTemplates(): Promise<ActionResult<Template>> {
  return fetchWithAuth<Template>(API_ENDPOINTS.TEMPLATES.BASE, {
    errorPrefix: "Failed to fetch templates",
  });
}

export async function searchTemplateItems(
  params: TemplateSearchParams
): Promise<ActionResult<TemplateSearchResponse>> {
  return fetchWithAuth<TemplateSearchResponse>(API_ENDPOINTS.TEMPLATES.SEARCH, {
    method: "POST",
    body: params,
    errorPrefix: "Failed to search template items",
  });
}

export async function getTemplateCollections(): Promise<
  ActionResult<TemplateCollection[]>
> {
  return fetchWithAuth<TemplateCollection[]>(
    API_ENDPOINTS.TEMPLATES.COLLECTIONS,
    {
      errorPrefix: "Failed to fetch template collections",
    }
  );
}

export async function getTemplateCategories(): Promise<
  ActionResult<TemplateCategory[]>
> {
  return fetchWithAuth<TemplateCategory[]>(API_ENDPOINTS.TEMPLATES.CATEGORIES, {
    errorPrefix: "Failed to fetch template categories",
  });
}

export type CreateItemPayload = {
  name: string;
  item_condition?: string;
  category_id?: string;
};

export async function addItemToCollection(
  propertyId: string,
  unitId: string,
  collectionId: string,
  item: CreateItemPayload
): Promise<ActionResult<unknown>> {
  return fetchWithAuth(
    API_ENDPOINTS.PROPERTIES.ITEMS(propertyId, unitId, collectionId),
    {
      method: "POST",
      body: item,
      errorPrefix: "Failed to add item to collection",
    }
  );
}

export async function addItemsToCollection(
  propertyId: string,
  unitId: string,
  collectionId: string,
  items: CreateItemPayload[]
): Promise<ActionResult<{ success: number; failed: number }>> {
  const results = await Promise.allSettled(
    items.map((item) =>
      addItemToCollection(propertyId, unitId, collectionId, item)
    )
  );

  const success = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;
  const failed = results.length - success;

  return {
    success: true,
    data: { success, failed },
  };
}
