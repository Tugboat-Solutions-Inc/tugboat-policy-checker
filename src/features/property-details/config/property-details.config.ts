import { UserType, UserTypeConfig } from "../types/property-details.types";

export const PROPERTY_DETAIL_CONFIG: Record<UserType, UserTypeConfig> = {
  INDIVIDUAL: {
    sectionTitle: "User management",
    sectionDescription: "Manage user access and permissions for this property.",
    inviteButtonText: "Invite Users",
    roleOptions: [
      { value: "OWNER", label: "Owner" },
      { value: "CAN_EDIT", label: "Can edit" },
      { value: "CAN_VIEW", label: "Can view" },
    ],
    showCompanyField: false,
    deleteDialogTitle: "Delete Property?",
    deleteDialogDescription:
      "This will permanently delete the property and any users it is shared with will no longer be able to access it.",
  },
  MULTI_TENANT: {
    sectionTitle: "Tenant Management",
    sectionDescription: "Manage tenant access and permissions for this unit.",
    inviteButtonText: "Invite Users",
    roleOptions: [
      { value: "OWNER", label: "Owner" },
      { value: "CAN_EDIT", label: "Can edit" },
      { value: "CAN_VIEW", label: "Can view" },
    ],
    showCompanyField: false,
    deleteDialogTitle: "Delete Property?",
    deleteDialogDescription:
      "This will permanently delete the property and any users it is shared with will no longer be able to access it.",
  },
  COMPANY: {
    sectionTitle: "User Management",
    sectionDescription:
      "Invite your clients to view or edit their property inventory.",
    inviteButtonText: "Invite Clients",
    roleOptions: [
      { value: "ADMIN", label: "Admin" },
      { value: "TEAM_MEMBER", label: "Team Member" },
      { value: "CAN_VIEW", label: "Can view" },
      { value: "CAN_EDIT", label: "Can edit" },
    ],
    showCompanyField: true,
    deleteDialogTitle: "Delete Property?",
    deleteDialogDescription:
      "This will permanently delete the property and any clients will no longer be able to access it.",
  },
} as const;
