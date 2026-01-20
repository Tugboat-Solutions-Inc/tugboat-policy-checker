"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type { Category, GetCategoriesResponse } from "../types/category.types";

type CreateCategoryData = {
  name: string;
};

export async function createCategory(
  propertyId: string,
  unitId: string,
  data: CreateCategoryData
): Promise<ActionResult<Category>> {
  const result = await fetchWithAuth<Category>(
    API_ENDPOINTS.PROPERTIES.CATEGORIES(propertyId, unitId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create category",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function updateCategory(
  propertyId: string,
  unitId: string,
  categoryId: string,
  data: CreateCategoryData
): Promise<ActionResult<Category>> {
  const result = await fetchWithAuth<Category>(
    API_ENDPOINTS.PROPERTIES.CATEGORIES_UPDATE(propertyId, categoryId, unitId),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update category",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function getCategories(
  propertyId: string,
  unitId: string,
  page?: number,
  page_size?: number
): Promise<ActionResult<GetCategoriesResponse>> {
  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append("page", String(page));
  if (page_size !== undefined)
    queryParams.append("page_size", String(page_size));

  const url = `${API_ENDPOINTS.PROPERTIES.CATEGORIES(propertyId, unitId)}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return fetchWithAuth<GetCategoriesResponse>(url, {
    errorPrefix: "Failed to fetch categories",
  });
}

export async function deleteCategory(
  propertyId: string,
  unitId: string,
  categoryId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.CATEGORIES_UPDATE(propertyId, categoryId, unitId),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete category",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}
