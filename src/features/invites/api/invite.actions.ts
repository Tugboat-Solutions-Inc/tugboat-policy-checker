"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type { Invite } from "../types/invite.types";
import type { AccessType } from "@/features/property-details/types/property-access.types";

export async function getInviteByToken(
  token: string
): Promise<ActionResult<Invite>> {
  try {
    const response = await fetch(API_ENDPOINTS.INVITES.BY_TOKEN(token));

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return {
        success: false,
        message: `Failed to fetch invite: ${errorText}`,
      };
    }

    const data = (await response.json()) as Invite;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch invite",
    };
  }
}

export async function createPropertyAccessInvites(
  propertyId: string,
  unitId: string,
  users: Array<{ email: string; access_type: AccessType; is_client: boolean }>
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.ACCESS_INVITES(propertyId),
    {
      method: "POST",
      body: {
        unit_id: unitId,
        users,
      },
      errorPrefix: "Failed to create property access invites",
    }
  );
}

export async function createOrganizationInvite(
  organizationId: string,
  email: string,
  orgRole: "ADMIN" | "MEMBER"
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.ORGANIZATIONS.INVITE(organizationId),
    {
      method: "POST",
      body: {
        email,
        org_role: orgRole,
      },
      errorPrefix: "Failed to invite user to organization",
    }
  );
}

export async function deletePropertyAccess(
  propertyId: string,
  accessId: string
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.DELETE_ACCESS(propertyId, accessId),
    {
      method: "DELETE",
      errorPrefix: "Failed to remove user access",
    }
  );
}

export async function updatePropertyAccess(
  propertyId: string,
  accessId: string,
  accessType: "VIEWER" | "EDITOR"
): Promise<ActionResult<null>> {
  return fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.UPDATE_ACCESS(propertyId, accessId),
    {
      method: "PUT",
      body: {
        access_type: accessType,
      },
      errorPrefix: "Failed to update user access",
    }
  );
}
