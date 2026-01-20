import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import AuthLoginForm from "@/features/auth/components/auth-login-form";
import AuthSocialLoginSection from "@/features/auth/components/auth-social-login-section";
import TextLink from "@/components/common/text-link";
import TextSeparator from "@/components/common/text-separator";
import { ROUTES } from "@/config/routes";

export default function LoginPage() {
  return (
    <div className="space-y-10">
      <AuthIntroSection title="Log In" description="Log into your account" />
      <div className="space-y-8">
        <AuthLoginForm />
        <TextSeparator label="or" />
        <AuthSocialLoginSection />
        <div className="text-center">
          <TextLink
            label="Don't have an account yet? Sign up"
            href={ROUTES.AUTH.SIGNUP}
          />
        </div>
      </div>
    </div>
  );
}
