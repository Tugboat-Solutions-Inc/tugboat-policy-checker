"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  PropertyCreateInput,
  Property,
  GetPropertiesResponse,
} from "../types/property.types";

export type { ActionResult };

export async function createProperty(
  property: PropertyCreateInput
): Promise<ActionResult<Property>> {
  const result = await fetchWithAuth<Property>(API_ENDPOINTS.PROPERTIES.BASE, {
    method: "POST",
    body: property,
    errorPrefix: "Failed to create property",
  });

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");
  }

  return result;
}

export async function getProperties(): Promise<
  ActionResult<GetPropertiesResponse>
> {
  return fetchWithAuth<GetPropertiesResponse>(API_ENDPOINTS.PROPERTIES.BASE, {
    errorPrefix: "Failed to fetch properties",
  });
}

export async function getPropertyById(
  propertyId: string
): Promise<ActionResult<Property>> {
  return fetchWithAuth<Property>(
    `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`,
    {
      errorPrefix: "Failed to fetch property",
    }
  );
}

export async function deleteProperty(
  propertyId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`,
    {
      method: "DELETE",
      errorPrefix: "Failed to delete property",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");
  }

  return result;
}

export async function updateProperty(
  propertyId: string,
  updates: Partial<PropertyCreateInput>
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`,
    {
      method: "PUT",
      body: updates,
      errorPrefix: "Failed to update property",
    }
  );
  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");
  }

  return result;
}

export async function updatePropertyFavorite(
  propertyId: string,
  favorite: boolean
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    `${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`,
    {
      method: "PUT",
      body: { favorite },
      errorPrefix: "Failed to update favorite",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT, "layout");
  }

  return result;
}
