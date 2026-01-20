import type {
  AccessType,
  OrganizationRole,
} from "@/features/property-details/types/property-access.types";

export type OrganizationType = "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY";

export type InviteOrganization = {
  id: string;
  name: string;
  logo_url: string | null;
  organization_type: OrganizationType;
  created_at: string;
  updated_at: string;
};

export type InviteProperty = {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type InviteUnit = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Invite = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  organization: InviteOrganization;
  organization_user_role: OrganizationRole;
  property_id: string | null;
  property: InviteProperty | null;
  unit_id: string | null;
  unit: InviteUnit | null;
  unit_access_type: AccessType | null;
  accepted: boolean;
  invited_by: string;
};

export function isPropertyInvite(invite: Invite): boolean {
  return invite.property_id !== null;
}

export function getInviteStatus(
  invite: Invite
): "PENDING" | "ACCEPTED" | "EXPIRED" {
  if (invite.accepted) return "ACCEPTED";
  if (new Date(invite.expires_at) < new Date()) return "EXPIRED";
  return "PENDING";
}
