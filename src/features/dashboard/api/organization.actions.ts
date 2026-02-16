"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { ROUTES } from "@/config/routes";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import { createClient } from "@/utils/supabase/server";
import { decodeAccessToken } from "@/lib/jwt";
import type {
  Organization,
  UpdateOrganization,
  OrganizationType,
} from "../types/organization.types";

export async function getOrganizationById(
  organizationId: string
): Promise<ActionResult<Organization>> {
  return fetchWithAuth<Organization>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS(organizationId),
    {
      errorPrefix: "Failed to fetch organization",
    }
  );
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganization
): Promise<ActionResult<Organization>> {
  const result = await fetchWithAuth<Organization>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS(organizationId),
    {
      method: "PUT",
      body: data,
      errorPrefix: "Failed to update organization",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT);
  }

  return result;
}

export async function updateOrganizationType(
  organizationType: OrganizationType
): Promise<ActionResult<Organization>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, message: "Not authenticated" };
  }

  const decodedToken = decodeAccessToken(session.access_token);
  const primaryOrg = decodedToken?.orgs?.find((org) => org.owner) ?? decodedToken?.orgs?.[0];
  const organizationId = primaryOrg?.org_id;

  if (!organizationId) {
    return { success: false, message: "No organization found for current user" };
  }

  const result = await fetchWithAuth<Organization>(
    API_ENDPOINTS.PROPERTIES.ORGANIZATIONS(organizationId),
    {
      method: "PUT",
      body: { organization_type: organizationType },
      errorPrefix: "Failed to update organization type",
    }
  );

  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.ROOT);
    revalidatePath("/");
  }

  return result;
}

