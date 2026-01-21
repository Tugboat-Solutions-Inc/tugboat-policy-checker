"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { decodeAccessToken } from "@/lib/jwt";
import { ROUTES } from "@/config/routes";

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

export function WelcomeTokenHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleHashToken = async () => {
      const hash = window.location.hash;
      
      if (!hash || !hash.includes("access_token")) {
        setIsProcessing(false);
        return;
      }

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken) {
        setIsProcessing(false);
        return;
      }

      try {
        const supabase = createClient();
        
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          setIsProcessing(false);
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);

        const decodedToken = decodeAccessToken(accessToken);
        const onboardingComplete = decodedToken?.onboarding_complete;
        const orgType = decodedToken?.orgs?.[0]?.org_type;
        const orgRole = decodedToken?.orgs?.[0]?.role;

        if (onboardingComplete) {
          router.replace(ROUTES.DASHBOARD.ROOT);
        } else {
          const onboardingRoute = getOnboardingRoute(orgType, orgRole);
          router.replace(onboardingRoute);
        }
      } catch (error) {
        console.error("Error processing token:", error);
        setIsProcessing(false);
      }
    };

    handleHashToken();
  }, [router]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
