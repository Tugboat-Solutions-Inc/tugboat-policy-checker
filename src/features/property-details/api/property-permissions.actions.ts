"use server";

import { ActionResult } from "@/features/auth/api/user.actions";
import {
  Capability,
  ROLE_CAPABILITIES,
} from "@/constants/permissions.constants";
import { getUserCapabilities } from "@/lib/permissions";
import { getCachedPropertyAccess, getCachedUser } from "@/lib/cached-fetchers";
import { createClient } from "@/utils/supabase/server";
import { decodeAccessToken } from "@/lib/jwt";

export async function getPropertyPermissions(
  propertyId: string
): Promise<ActionResult<Capability[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const decoded = decodeAccessToken(session.access_token);
    const currentOrg = decoded?.orgs?.[0];

    if (currentOrg?.owner || currentOrg?.role === "ADMIN") {
      return {
        success: true,
        data: ROLE_CAPABILITIES.EDITOR,
      };
    }

    const [propertyAccess, user] = await Promise.all([
      getCachedPropertyAccess(propertyId),
      getCachedUser(),
    ]);

    if (!user.success) {
      return {
        success: false,
        message: user.message || "Failed to fetch user",
      };
    }

    if (!propertyAccess.success) {
      return {
        success: false,
        message: propertyAccess.message || "Failed to fetch property access",
      };
    }

    const capabilities = getUserCapabilities(propertyAccess.data, user.data.id);

    return {
      success: true,
      data: capabilities.length > 0 ? capabilities : ROLE_CAPABILITIES.VIEWER,
    };
  } catch (error) {
    console.error("Error fetching property permissions:", error);
    return {
      success: false,
      message: "Failed to fetch property permissions",
    };
  }
}
