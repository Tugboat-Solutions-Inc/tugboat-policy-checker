import { User } from "@/features/auth/types/user.types";
import {
  AccessType,
  OrganizationRole,
} from "@/features/property-details/types/property-access.types";
import { Unit } from "./unit.types";

export type OrganizationType = "MULTI_TENANT" | "INDIVIDUAL" | "COMPANY";

export type PropertyAccess = {
  id: string;
  created_at: string;
  updated_at: string;
  access_type: AccessType;
  is_client: boolean;
};

export type OrganizationProperty = {
  id: string;
  name: string;
  address: string;
  address_place_id: string;
  created_at: string;
  updated_at: string;
  units: Unit[];
  last_uploads: null;
  owner_id: string;
  total_collections: number;
  total_items: number;
  total_value: number;
  avg_value: number;
  accesses: PropertyAccess[] | null;
};

export type Organization = {
  id: string;
  name: string;
  logo_url: string | null;
  organization_type: OrganizationType;
  created_at: string;
  updated_at: string;
  properties: OrganizationProperty[];
};

export type UpdateOrganization = {
  name?: string;
  logo_b64?: string;
  remove_logo?: boolean;
  organization_type?: OrganizationType;
};

export type OrganizationUser = {
  id: string;
  user_id: string;
  user: User;
  organization_id: string;
  created_at: string;
  updated_at: string;
  role: OrganizationRole;
};
