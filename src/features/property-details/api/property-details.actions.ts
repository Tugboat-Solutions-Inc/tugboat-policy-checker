"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type { Property } from "@/features/auth/types/property.types";
import type {
  AccessType,
  propertyAccess,
} from "../types/property-access.types";
import {
  PropertyDetails,
  RoleType,
  UserType,
  PropertyDataProvider,
} from "../types/property-details.types";
import individualProvider from "../data/individual";
import multiTenantProvider from "../data/multi-tenant";
import companyProvider from "../data/company";
import {
  getCachedPropertyById,
  getCachedPropertyAccess,
} from "@/lib/cached-fetchers";

const PROPERTY_DATA_PROVIDERS: Record<UserType, PropertyDataProvider> = {
  INDIVIDUAL: individualProvider,
  MULTI_TENANT: multiTenantProvider,
  COMPANY: companyProvider,
};

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

export async function getPropertyDetailsData(
  propertyId: string,
  userType: string
): Promise<{
  property: ActionResult<Property>;
  propertyAccess: ActionResult<propertyAccess[]> | null;
}> {
  const propertyPromise = getCachedPropertyById(propertyId);

  const accessPromise =
    userType !== "MULTI_TENANT"
      ? getCachedPropertyAccess(propertyId)
      : Promise.resolve(null);

  const [property, propertyAccess] = await Promise.all([
    propertyPromise,
    accessPromise,
  ]);

  return { property, propertyAccess };
}

export async function updateProperty(
  propertyId: string,
  updates: { name?: string; address_place_id?: string }
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(`${API_ENDPOINTS.PROPERTIES.BASE}/${propertyId}`, {
    method: "PUT",
    body: updates,
    errorPrefix: "Failed to update property",
  });
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

export async function createPropertyAccess(
  propertyId: string,
  unitId: string,
  users: Array<{ email: string; access_type: AccessType }>
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

export async function updatePropertyAction(
  userType: UserType,
  propertyId: string,
  payload: Partial<PropertyDetails>
) {
  const provider = PROPERTY_DATA_PROVIDERS[userType];
  await provider.updateProperty(propertyId, payload);
}

export async function deletePropertyAction(
  userType: UserType,
  propertyId: string
) {
  const provider = PROPERTY_DATA_PROVIDERS[userType];
  await provider.deleteProperty(propertyId);
}

export async function inviteUserAction(
  userType: UserType,
  propertyId: string,
  payload: { email: string; role: RoleType }
) {
  const provider = PROPERTY_DATA_PROVIDERS[userType];
  await provider.inviteUser(propertyId, payload);
}

export async function removeUserAction(
  userType: UserType,
  propertyId: string,
  userId: string
) {
  const provider = PROPERTY_DATA_PROVIDERS[userType];
  await provider.removeUser(propertyId, userId);
}

export async function updateUserRoleAction(
  userType: UserType,
  propertyId: string,
  userId: string,
  role: RoleType
) {
  const provider = PROPERTY_DATA_PROVIDERS[userType];
  await provider.updateUserRole(propertyId, userId, role);
}
