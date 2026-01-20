import { UnitDetailsPage } from "./unit-details-page";
import type { UnitDetails, UnitTenant } from "../../api/tenant-dashboard.actions";
import type { Access } from "@/features/auth/types/property.types";
import { getUserDisplayInfo } from "@/lib/utils";

interface UnitDetailsWrapperProps {
  propertyId: string;
  unitId: string;
  unitName: string;
  accesses: Access[];
}

function mapAccessToTenant(access: Access, currentUserId?: string): UnitTenant {
  const user = access.organization_user.user;
  const { displayName, initials, email } = getUserDisplayInfo(user);

  const orgUserRole = access.organization_user.role;
  const isClient = access.is_client;
  
  let accessType: "OWNER" | "TENANT" | "MANAGER";
  if (orgUserRole === "ADMIN") {
    accessType = "OWNER";
  } else if (isClient) {
    accessType = "TENANT";
  } else {
    accessType = "MANAGER";
  }

  return {
    id: access.id,
    name: displayName,
    initials,
    avatarUrl: user?.profile_picture_url || undefined,
    accessType,
    isCurrentUser: access.organization_user.user_id === currentUserId,
    email,
    accessLevel: access.access_type as "VIEWER" | "EDITOR",
    organizationUserId: access.organization_user.id,
  };
}

export function UnitDetailsWrapper({
  propertyId,
  unitId,
  unitName,
  accesses,
}: UnitDetailsWrapperProps) {
  const tenants = accesses.map((access) => mapAccessToTenant(access));

  const unit: UnitDetails = {
    id: unitId,
    name: unitName,
    propertyAddress: "",
    tenants,
  };

  return <UnitDetailsPage propertyId={propertyId} unit={unit} />;
}
