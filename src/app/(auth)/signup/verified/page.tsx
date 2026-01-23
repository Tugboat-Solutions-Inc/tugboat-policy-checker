import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/common/nav-link";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/utils/supabase/server";
import { decodeAccessToken } from "@/lib/jwt";
import { headers } from "next/headers";
import { Smartphone } from "lucide-react";

const MOBILE_DEEP_LINK = "tugboat://tugboat.app";

function getOnboardingRoute(orgType: string | undefined, orgRole: string | undefined): string {
  if (orgRole === "MEMBER") {
    return ROUTES.AUTH.ONBOARDING_MEMBER;
  }

  switch (orgType) {
    case "MULTI_TENANT":
      return ROUTES.AUTH.ONBOARDING_MULTI_TENANT;
    case "COMPANY":
      return ROUTES.AUTH.ONBOARDING_COMPANY;
    default:
      return ROUTES.AUTH.ONBOARDING;
  }
}

function detectMobileDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}

interface SignupVerifiedPageProps {
  searchParams: Promise<{ adminInvite?: string; retool?: string }>;
}

export default async function SignupVerifiedPage({ searchParams }: SignupVerifiedPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobileDevice = detectMobileDevice(userAgent);

  const isWebSignup = session?.user?.user_metadata?.source === "web";
  const showMobileOption = !isWebSignup;

  let onboardingRoute: string = ROUTES.AUTH.ONBOARDING;

  if (session?.access_token) {
    const decodedToken = decodeAccessToken(session.access_token);
    const orgType = decodedToken?.orgs?.[0]?.org_type;
    const orgRole = decodedToken?.orgs?.[0]?.role;
    onboardingRoute = getOnboardingRoute(orgType, orgRole);
  }

  const buildMobileDeepLink = (): string => {
    if (!session?.access_token || !session?.refresh_token) {
      return MOBILE_DEEP_LINK;
    }

    const params = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return `${MOBILE_DEEP_LINK}?${params.toString()}`;
  };

  if (showMobileOption) {
    const webAppButton = (
      <NavLink href={onboardingRoute} className="block">
        <Button
          variant={isMobileDevice ? "outline" : "default"}
          size="lg"
          className="h-12 w-full"
        >
          Continue in web app
        </Button>
      </NavLink>
    );

    const mobileAppButton = (
      <a href={buildMobileDeepLink()} className="block">
        <Button
          variant={isMobileDevice ? "default" : "outline"}
          size="lg"
          className="h-12 w-full"
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Continue in mobile app
        </Button>
      </a>
    );

    return (
      <div className="space-y-10">
        <AuthIntroSection
          title="Your account has been successfully verified!"
          description=""
        />
        <div className="space-y-3">
          {isMobileDevice ? (
            <>
              {mobileAppButton}
              {webAppButton}
            </>
          ) : (
            <>
              {webAppButton}
              {mobileAppButton}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Your account has been successfully verified!"
        description=""
      />
      <NavLink href={onboardingRoute} className="block">
        <Button variant="default" size="lg" className="h-12 w-full">
          Continue to Onboarding
        </Button>
      </NavLink>
    </div>
  );
}
