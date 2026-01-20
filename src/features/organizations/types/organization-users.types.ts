import { User } from "@/features/auth/types/user.types";

export type OrganizationUserRole = "ADMIN" | "MEMBER";

export type OrganizationUser = {
  id: string;
  user_id: string;
  user: User;
  organization_id: string;
  created_at: string;
  updated_at: string;
  role: OrganizationUserRole;
  is_client: boolean;
};

export type UpdateOrganizationUserInput = {
  role: OrganizationUserRole;
};
