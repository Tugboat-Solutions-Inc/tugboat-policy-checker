import AuthForgotPasswordForm from "@/features/auth/components/auth-forgot-password-form";
import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Forgot Password"
        description="Enter your email address and we'll send you a password reset link"
        showBackIcon
      />
      <AuthForgotPasswordForm />
    </div>
  );
}
