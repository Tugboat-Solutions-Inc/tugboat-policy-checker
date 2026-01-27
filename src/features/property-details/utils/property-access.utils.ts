import type { propertyAccess } from "../types/property-access.types";

interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

interface CurrentOrg {
  org_id: string;
  owner: boolean;
  role: string;
}

export function addOwnerToAccessList(
  accessState: propertyAccess[],
  user: CurrentUser | null,
  currentOrg: CurrentOrg | null
): propertyAccess[] {
  if (!user || !currentOrg) return accessState;

  const isOrgAdmin = currentOrg.owner || currentOrg.role === "ADMIN";
  if (!isOrgAdmin) return accessState;

  if (accessState.some((a) => a.organization_user.user_id === user.id)) {
    return accessState;
  }

  return [
    {
      id: `owner-${user.id}`,
      organization_user: {
        id: `org-user-${user.id}`,
        user_id: user.id,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_picture_url: user.profilePictureUrl,
        },
        organization_id: currentOrg.org_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: "ADMIN",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      access_type: "EDITOR",
      is_client: false,
    },
    ...accessState,
  ];
}
