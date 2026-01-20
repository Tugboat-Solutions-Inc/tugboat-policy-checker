"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  AccessType,
  propertyAccess,
} from "../types/property-access.types";

export async function getPropertyAccess(
  propertyId: string
): Promise<ActionResult<propertyAccess[]>> {
  return fetchWithAuth<propertyAccess[]>(
    API_ENDPOINTS.PROPERTIES.ACCESS(propertyId),
    {
      errorPrefix: "Failed to fetch property access",
    }
  );
}

export async function updatePropertyAccess(
  propertyId: string,
  accessId: string,
  accessType: AccessType
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.UPDATE_ACCESS(propertyId, accessId),
    {
      method: "PUT",
      body: { access_type: accessType },
      errorPrefix: "Failed to update property access",
    }
  );
}

export async function removePropertyAccess(
  propertyId: string,
  accessId: string
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.UPDATE_ACCESS(propertyId, accessId),
    {
      method: "DELETE",
      errorPrefix: "Failed to remove property access",
    }
  );
}

export async function createPropertyAccess(
  propertyId: string,
  unitId: string,
  users: Array<{ email: string; access_type: AccessType; is_client?: boolean }>
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(API_ENDPOINTS.PROPERTIES.ACCESS(propertyId), {
    method: "POST",
    body: {
      users,
      unit_id: unitId,
    },
    errorPrefix: "Failed to create property access",
  });
}
