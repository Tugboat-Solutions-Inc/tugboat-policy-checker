export type { UserType } from "@/constants/user-types";

export type RoleType =
  | "OWNER"
  | "ADMIN"
  | "TEAM_MEMBER"
  | "CAN_EDIT"
  | "CAN_VIEW";

export interface PropertyUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  role: RoleType;
  companyName?: string;
  isCurrentUser?: boolean;
}

export interface PropertyDetails {
  id: string;
  name: string;
  address: string;
  address_place_id?: string;
  users: PropertyUser[];
}

export interface UserTypeConfig {
  sectionTitle: string;
  sectionDescription: string;
  inviteButtonText: string;
  roleOptions: { value: RoleType; label: string }[];
  showCompanyField: boolean;
  deleteDialogTitle: string;
  deleteDialogDescription: string;
}

export interface PropertyDataProvider {
  fetchPropertyDetails: (id: string) => Promise<PropertyDetails>;
  updateProperty: (
    id: string,
    payload: Partial<PropertyDetails>
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  inviteUser: (
    propertyId: string,
    payload: { email: string; role: RoleType }
  ) => Promise<void>;
  removeUser: (propertyId: string, userId: string) => Promise<void>;
  updateUserRole: (
    propertyId: string,
    userId: string,
    role: RoleType
  ) => Promise<void>;
}
