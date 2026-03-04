export const ROUTES = {
  HOME: "/",

  INVITE: {
    ROOT: "/invite",
    ACCEPT: (token: string) => `/invite?token=${token}`,
  },

  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    SIGNUP_WITH_INVITE: (token: string) => `/signup?invite_token=${token}`,
    SIGNUP_SUCCESS: "/signup/success",
    SIGNUP_VERIFIED: "/signup/verified",
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_SENT: "/forgot-password/sent",
    RESET_PASSWORD: "/reset-password",
    RESET_PASSWORD_SUCCESS: "/reset-password/success",
    WELCOME: "/welcome",
    ONBOARDING: "/onboarding",
    ONBOARDING_MULTI_TENANT: "/onboarding/multi-tenant",
    ONBOARDING_COMPANY: "/onboarding/company",
    ONBOARDING_MEMBER: "/onboarding/member",
    ACCOUNT_VERIFIED: "/account-verified",
    CALLBACK: "/auth/callback",
  },

  DASHBOARD: {
    ROOT: "/dashboard",
    PROFILE: "/profile",
    SETTINGS: "/dashboard/settings",
    ALL_UPLOADS: (propertyId: string) =>
      `/dashboard/property/${propertyId}/uploads`,
    PROPERTY_DETAILS: (propertyId: string) =>
      `/dashboard/property/${propertyId}/details`,
    UNIT_DETAILS: (propertyId: string, unitId: string) =>
      `/dashboard/property/${propertyId}/units/${unitId}`,
    PROPERTY: (id: string) => `/dashboard/property/${id}`,
    COLLECTION: (propertyId: string, collectionId: string, unitId: string) =>
      `/dashboard/property/${propertyId}/collections/${collectionId}?unitId=${unitId}`,

    // Tools
    POLICY_CHECKER: "/dashboard/tools/policy-checker",
    POLICY_CHECKER_REPORT: (reportId: string) =>
      `/dashboard/tools/policy-checker/${reportId}`,
  },

  EXAMPLE: {
    HOME: "/example",
    POSTS: {
      LIST: "/example/posts",
      DETAIL: (id: string) => `/example/posts/${id}`,
      NEW: "/example/posts/new",
      NEW_RHF: "/example/posts/new-rhf",
    },
  },
} as const;

export const EMAIL_REDIRECT_URLS = {
  SIGNUP_VERIFIED: (baseUrl: string) => `${baseUrl}${ROUTES.AUTH.CALLBACK}`,
  RESET_PASSWORD: (baseUrl: string) => `${baseUrl}${ROUTES.AUTH.CALLBACK}?next=${ROUTES.AUTH.RESET_PASSWORD}`,
} as const;
