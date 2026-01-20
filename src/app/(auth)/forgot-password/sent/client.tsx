"use client";

import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { forgotPassword } from "@/features/auth/api/auth.actions";

type ForgotPasswordSentClientProps = {
  emailHint: string | null;
};

export default function ForgotPasswordSentClient({
  emailHint,
}: ForgotPasswordSentClientProps) {
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
      const formData = new FormData();
      formData.append("email", emailHint);
      formData.append("resend", "true");
      await forgotPassword(null, formData);

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
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Check your inbox"
        description={`We've sent a password reset link to `}
        emailHint={emailHint}
        showBackIcon
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

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </div>
  );
}
