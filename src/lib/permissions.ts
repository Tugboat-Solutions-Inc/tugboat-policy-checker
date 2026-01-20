import {
  propertyAccess,
  AccessType,
} from "@/features/property-details/types/property-access.types";
import {
  ROLE_CAPABILITIES,
  Capability,
} from "@/constants/permissions.constants";

export function getUserRole(
  access: propertyAccess[],
  userId: string
): AccessType | null {
  const userAccess = access.find((a) => a.organization_user.user_id === userId);
  return userAccess?.access_type ?? null;
}

export function getUserCapabilities(
  access: propertyAccess[],
  userId: string
): Capability[] {
  const role = getUserRole(access, userId);
  if (!role) {
    return [];
  }
  return ROLE_CAPABILITIES[role];
}

export function isUserViewOnly(
  access: propertyAccess[],
  userId: string
): boolean {
  const role = getUserRole(access, userId);
  if (!role) {
    return true;
  }
  return role === "VIEWER";
}
