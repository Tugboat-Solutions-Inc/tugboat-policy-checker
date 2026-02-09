export const ORG_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type OrgRole = (typeof ORG_ROLES)[keyof typeof ORG_ROLES];

export const ACCESS_TYPES = {
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

export type AccessType = (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
