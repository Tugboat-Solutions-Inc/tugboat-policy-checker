import { Suspense } from "react";
import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import AuthResetPasswordForm from "@/features/auth/components/auth-reset-password-form";

function ResetPasswordFormWrapper() {
  return (
    <div className="space-y-8">
      <AuthResetPasswordForm />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Reset Your Password"
        description="Create a new password to secure your account."
      />
      <Suspense fallback={<div className="space-y-8">Loading...</div>}>
        <ResetPasswordFormWrapper />
      </Suspense>
    </div>
  );
}
