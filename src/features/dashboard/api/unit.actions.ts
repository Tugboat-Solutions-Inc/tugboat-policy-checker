"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import { getAuthHeaders } from "@/lib/auth";
import type { CreateUnit, Unit } from "../types/unit.types";

export async function createUnit(
  propertyId: string,
  data: CreateUnit
): Promise<ActionResult<Unit>> {
  const result = await fetchWithAuth<Unit>(
    API_ENDPOINTS.PROPERTIES.UNITS(propertyId),
    {
      method: "POST",
      body: data,
      errorPrefix: "Failed to create unit",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function updateUnit(
  propertyId: string,
  unitId: string,
  data: Partial<CreateUnit>
): Promise<ActionResult<Unit>> {
  const result = await fetchWithAuth<Unit>(
    API_ENDPOINTS.PROPERTIES.UNITS_UPDATE(propertyId, unitId),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update unit",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function deleteUnit(
  propertyId: string,
  unitId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.UNITS_UPDATE(propertyId, unitId),
    {
      method: "DELETE",
      errorPrefix: "Failed to delete unit",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
  }

  return result;
}

export async function importUnits(
  propertyId: string,
  formData: FormData
): Promise<ActionResult<null>> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const response = await fetch(
      API_ENDPOINTS.PROPERTIES.UNITS_IMPORT(propertyId),
      {
        method: "POST",
        headers: authHeaders,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return {
        success: false,
        message: `Failed to import units: ${errorText}`,
      };
    }

    revalidatePath(ROUTES.DASHBOARD.PROPERTY(propertyId));
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to import units",
    };
  }
}
