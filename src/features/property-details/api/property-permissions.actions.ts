"use server";

import { ActionResult } from "@/features/auth/api/user.actions";
import {
  Capability,
  CAPABILITIES,
  ROLE_CAPABILITIES,
} from "@/constants/permissions.constants";
import { getUserCapabilities } from "@/lib/permissions";
import {
  getCachedPropertyAccess,
  getCachedPropertyById,
  getCachedUser,
} from "@/lib/cached-fetchers";
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

    const isClient = currentOrg?.is_client === true;

    if (!isClient && (currentOrg?.owner || currentOrg?.role === "ADMIN")) {
      const propertyResult = await getCachedPropertyById(propertyId);
      if (propertyResult.success && propertyResult.data.owner_id === decoded?.sub) {
        return {
          success: true,
          data: ROLE_CAPABILITIES.EDITOR,
        };
      }
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

    let capabilities = getUserCapabilities(propertyAccess.data, user.data.id);

    capabilities = capabilities.filter(cap => cap !== CAPABILITIES.MANAGE_USERS);

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
