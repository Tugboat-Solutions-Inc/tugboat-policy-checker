import { ROUTES } from "@/config/routes";
import type { DecodedJWT } from "@/lib/jwt";
import { USER_TYPES } from "@/constants/user-types";
import { ORG_ROLES } from "@/constants/roles.constants";

export const ORG_TYPES = USER_TYPES;

type OrgType = (typeof ORG_TYPES)[keyof typeof ORG_TYPES] | undefined;
type OrgRole = string | undefined;

const ONBOARDING_ROUTE_MAP: Record<string, string> = {
  [ORG_TYPES.MULTI_TENANT]: ROUTES.AUTH.ONBOARDING_MULTI_TENANT,
  [ORG_TYPES.COMPANY]: ROUTES.AUTH.ONBOARDING_COMPANY,
  [ORG_TYPES.INDIVIDUAL]: ROUTES.AUTH.ONBOARDING,
};

const DEFAULT_ONBOARDING_ROUTE = ROUTES.AUTH.ONBOARDING;

export function getOnboardingRoute(decodedToken: DecodedJWT | null): string;
export function getOnboardingRoute(orgType: OrgType, orgRole: OrgRole): string;
export function getOnboardingRoute(
  decodedTokenOrOrgType: DecodedJWT | null | OrgType,
  orgRole?: OrgRole
): string {
  let orgType: OrgType;
  let role: OrgRole;

  if (orgRole !== undefined) {
    orgType = decodedTokenOrOrgType as OrgType;
    role = orgRole;
  } else {
    const decodedToken = decodedTokenOrOrgType as DecodedJWT | null;
    if (!decodedToken) {
      return DEFAULT_ONBOARDING_ROUTE;
    }
    const primaryOrg = decodedToken.orgs?.find((org) => org.owner) ?? decodedToken.orgs?.[0];
    orgType = primaryOrg?.org_type;
    role = primaryOrg?.role;
  }

  if (role === ORG_ROLES.MEMBER) {
    return ROUTES.AUTH.ONBOARDING_MEMBER;
  }

  return orgType && ONBOARDING_ROUTE_MAP[orgType]
    ? ONBOARDING_ROUTE_MAP[orgType]
    : DEFAULT_ONBOARDING_ROUTE;
}
