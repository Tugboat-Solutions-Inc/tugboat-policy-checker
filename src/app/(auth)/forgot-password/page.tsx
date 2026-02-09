import AuthForgotPasswordForm from "@/features/auth/components/auth-forgot-password-form";
import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";

export default function ForgotPasswordPage() {
  return (
    <article aria-labelledby="forgot-password-heading">
      <header>
        <AuthIntroSection
          title="Forgot Password"
          description="Enter your email address and we'll send you a password reset link"
          showBackIcon
          headingId="forgot-password-heading"
        />
      </header>
      
      <section className="mt-6 md:mt-10" aria-label="Password reset request">
        <AuthForgotPasswordForm />
      </section>
    </article>
  );
}
