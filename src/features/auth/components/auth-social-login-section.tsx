"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { ROUTES } from "@/config/routes";

interface AuthSocialLoginSectionProps {
  inviteToken?: string;
}

export default function AuthSocialLoginSection({
  inviteToken,
}: AuthSocialLoginSectionProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    
    const redirectTo = `${window.location.origin}${ROUTES.AUTH.CALLBACK}${inviteToken ? `?next=${ROUTES.INVITE.ACCEPT(inviteToken)}` : ""}`;
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    const supabase = createClient();
    
    const redirectTo = `${window.location.origin}${ROUTES.AUTH.CALLBACK}${inviteToken ? `?next=${ROUTES.INVITE.ACCEPT(inviteToken)}` : ""}`;
    
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
      },
    });
  };

  const isLoading = isGoogleLoading || isAppleLoading;

  return (
    <section aria-label="Social sign in options">
      <div className="space-y-3" role="group" aria-label="Continue with social accounts">
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          aria-busy={isGoogleLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14.3056 6.7695C14.3876 7.20883 14.4323 7.66817 14.4323 8.1475C14.4323 11.8968 11.923 14.5628 8.13298 14.5628C7.27106 14.5632 6.41752 14.3937 5.62114 14.064C4.82476 13.7343 4.10116 13.2509 3.49169 12.6415C2.88222 12.032 2.39883 11.3084 2.06915 10.512C1.73947 9.71563 1.56996 8.86209 1.57031 8.00017C1.56996 7.13825 1.73947 6.28471 2.06915 5.48833C2.39883 4.69195 2.88222 3.96835 3.49169 3.35888C4.10116 2.74941 4.82476 2.26602 5.62114 1.93634C6.41752 1.60666 7.27106 1.43715 8.13298 1.4375C9.90498 1.4375 11.3856 2.0895 12.5216 3.14817L10.6716 4.99817V4.9935C9.98298 4.3375 9.10898 4.00083 8.13298 4.00083C5.96765 4.00083 4.20765 5.83017 4.20765 7.99617C4.20765 10.1622 5.96765 11.9955 8.13298 11.9955C10.0976 11.9955 11.435 10.8715 11.7096 9.32883H8.13298V6.7695H14.3056Z"
              fill="currentColor"
            />
          </svg>
          <span>
            {isGoogleLoading ? "Redirecting to Google…" : "Continue with Google"}
          </span>
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12"
          onClick={handleAppleSignIn}
          disabled={isLoading}
          aria-busy={isAppleLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12.0393 13.824C11.2553 14.584 10.3994 14.464 9.57535 14.104C8.70335 13.736 7.90335 13.72 6.98335 14.104C5.83135 14.6 5.22335 14.456 4.53535 13.824C0.63135 9.8 1.20735 3.672 5.63935 3.448C6.71935 3.504 7.47135 4.04 8.10335 4.088C9.04735 3.896 9.95135 3.344 10.9593 3.416C12.1673 3.512 13.0794 3.992 13.6794 4.856C11.1834 6.352 11.7754 9.64 14.0633 10.56C13.6074 11.76 13.0154 12.952 12.0314 13.832L12.0393 13.824ZM8.02335 3.4C7.90335 1.616 9.35135 0.144 11.0154 0C11.2474 2.064 9.14335 3.6 8.02335 3.4Z"
              fill="currentColor"
            />
          </svg>
          <span>
            {isAppleLoading ? "Redirecting to Apple…" : "Continue with Apple"}
          </span>
        </Button>
      </div>
    </section>
  );
}
