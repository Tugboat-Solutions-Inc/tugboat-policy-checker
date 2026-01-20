"use client";

import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { resendVerificationEmail } from "@/features/auth/api/auth.actions";
import { useSearchParams } from "next/navigation";

type ResendVerificationClientProps = {
  emailHint: string | null;
};

export default function ResendVerificationClient({
  emailHint,
}: ResendVerificationClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);

    if (!emailHint) {
      setError("Something went wrong. Please try again later.");
      setIsLoading(false);
      return;
    }

    try {
      await resendVerificationEmail(null, emailHint);

      setCountdown(30);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Check your inbox"
        description={`We've sent a verification email to `}
        emailHint={emailHint}
      />
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full h-12"
          onClick={handleResend}
          loading={isLoading}
          disabled={countdown > 0 || isLoading}
        >
          Didn't Receive the link? Resend{" "}
          {countdown > 0 ? `(${countdown}s)` : ""}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
