import type { AccessUser } from "@/features/auth/types/property.types";

export type AccessType = "EDITOR" | "VIEWER";

export type OrganizationRole = "ADMIN" | "MEMBER";

export type propertyAccess = {
  id: string;
  organization_user: {
    id: string;
    user_id: string;
    user?: AccessUser | null;
    organization_id: string;
    created_at: string;
    updated_at: string;
    role: OrganizationRole;
  };
  created_at: string;
  updated_at: string;
  access_type: AccessType;
  is_client: boolean;
};
