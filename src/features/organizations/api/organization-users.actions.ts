"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "../types/organization-users.types";

export async function getOrganizationUsers(
  organizationId: string
): Promise<ActionResult<OrganizationUser[]>> {
  return fetchWithAuth<OrganizationUser[]>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS_USERS(organizationId),
    {
      errorPrefix: "Failed to fetch organization users",
    }
  );
}

export async function updateOrganizationUser(
  organizationId: string,
  userId: string,
  role: OrganizationUserRole
): Promise<ActionResult<OrganizationUser>> {
  const result = await fetchWithAuth<OrganizationUser>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS_USERS_UPDATE(organizationId, userId),
    {
      method: "PUT",
      body: { role },
      errorPrefix: "Failed to update organization user",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.SETTINGS);
  }

  return result;
}

export async function deleteOrganizationUser(
  organizationId: string,
  userId: string
): Promise<ActionResult<null>> {
  const result = await fetchWithAuth<null>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS_USERS_UPDATE(organizationId, userId),
    {
      method: "DELETE",
      errorPrefix: "Failed to remove organization user",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.SETTINGS);
  }

  return result;
}
