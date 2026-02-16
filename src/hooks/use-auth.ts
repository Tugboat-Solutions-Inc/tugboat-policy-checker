import { useAuthStore } from "@/stores/auth-store";
import { useImpersonationStore } from "@/stores/impersonation-store";

export function useAdminUser() {
  const decodedToken = useAuthStore((state) => state.decodedToken);

  if (!decodedToken) return null;

  const firstName = decodedToken.first_name?.trim() || "";
  const lastName = decodedToken.last_name?.trim() || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || decodedToken.email;
  const primaryOrg = decodedToken.orgs?.find((org) => org.owner) ?? decodedToken.orgs?.[0];

  return {
    id: decodedToken.sub,
    email: decodedToken.email,
    firstName,
    lastName,
    fullName,
    profilePictureUrl: decodedToken.profile_picture_url,
    phone: decodedToken.phone,
    role: decodedToken.role,
    onboardingComplete: decodedToken.onboarding_complete,
    accountType: primaryOrg?.org_type,
    orgName: primaryOrg?.org_name,
    orgLogoUrl: primaryOrg?.org_logo_url,
  };
}

export function useCurrentUser() {
  const adminUser = useAdminUser();
  const impersonatedUser = useImpersonationStore((state) => state.impersonatedUser);
  const impersonatedUserId = useImpersonationStore((state) => state.impersonatedUserId);

  if (impersonatedUserId && impersonatedUser) {
    const firstName = impersonatedUser.firstName?.trim() || "";
    const lastName = impersonatedUser.lastName?.trim() || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || impersonatedUser.email;

    return {
      id: impersonatedUser.id,
      email: impersonatedUser.email,
      firstName,
      lastName,
      fullName,
      profilePictureUrl: impersonatedUser.profilePictureUrl,
      phone: "",
      role: "USER" as const,
      onboardingComplete: true,
      accountType: adminUser?.accountType,
      orgName: adminUser?.orgName || "",
      orgLogoUrl: adminUser?.orgLogoUrl || null,
    };
  }

  return adminUser;
}

export function useCurrentOrg() {
  const getCurrentOrg = useAuthStore((state) => state.getCurrentOrg);
  return getCurrentOrg();
}

export function useAllOrgs() {
  const decodedToken = useAuthStore((state) => state.decodedToken);
  return decodedToken?.orgs || [];
}

export function useIsAuthenticated() {
  return useAuthStore((state) => state.isAuthenticated);
}

export function useUserRole() {
  const decodedToken = useAuthStore((state) => state.decodedToken);
  return decodedToken?.role || null;
}

export function useOrgType() {
  const getCurrentOrg = useAuthStore((state) => state.getCurrentOrg);
  const currentOrg = getCurrentOrg();
  return currentOrg?.org_type || null;
}

export function useIsAuthHydrated() {
  return useAuthStore((state) => state.isHydrated);
}
