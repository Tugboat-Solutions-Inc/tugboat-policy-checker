export type UserType = "INDIVIDUAL" | "MULTI_TENANT" | "COMPANY";

export const USER_TYPES = {
  INDIVIDUAL: "INDIVIDUAL" as UserType,
  MULTI_TENANT: "MULTI_TENANT" as UserType,
  COMPANY: "COMPANY" as UserType,
} as const;

