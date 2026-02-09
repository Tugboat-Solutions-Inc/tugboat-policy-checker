import { Suspense } from "react";
import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import AuthResetPasswordForm from "@/features/auth/components/auth-reset-password-form";

function ResetPasswordFormWrapper() {
  return <AuthResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <article aria-labelledby="reset-password-heading">
      <header>
        <AuthIntroSection
          title="Reset Your Password"
          description="Create a new password to secure your account."
          headingId="reset-password-heading"
        />
      </header>
      
      <section className="mt-6 md:mt-10" aria-label="Create new password">
        <Suspense 
          fallback={
            <div className="space-y-8" role="status" aria-label="Loading form">
              <span className="sr-only">Loading password reset form...</span>
            </div>
          }
        >
          <ResetPasswordFormWrapper />
        </Suspense>
      </section>
    </article>
  );
}
