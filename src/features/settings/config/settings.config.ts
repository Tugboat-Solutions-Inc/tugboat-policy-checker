import {
  PropertyUser,
  RoleType,
  UserTypeConfig,
} from "@/features/property-details/types/property-details.types";

export const TEAM_MANAGEMENT_CONFIG: UserTypeConfig = {
  sectionTitle: "Team Members",
  sectionDescription:
    "Manage your internal team's access and roles for this workspace.",
  inviteButtonText: "Invite Members",
  roleOptions: [
    { value: "ADMIN" as RoleType, label: "Admin" },
    { value: "TEAM_MEMBER" as RoleType, label: "Team Member" },
  ],
  showCompanyField: false,
  deleteDialogTitle: "Remove Team Member?",
  deleteDialogDescription:
    "This will remove the team member from your organization.",
};

export const MOCK_TEAM_MEMBERS: PropertyUser[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "ADMIN",
    initials: "JD",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "TEAM_MEMBER",
    initials: "JS",
  },
];
