import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import AuthLoginForm from "@/features/auth/components/auth-login-form";
import AuthSocialLoginSection from "@/features/auth/components/auth-social-login-section";
import TextLink from "@/components/common/text-link";
import TextSeparator from "@/components/common/text-separator";
import { ROUTES } from "@/config/routes";

export default function LoginPage() {
  return (
    <article aria-labelledby="login-heading">
      <header>
        <AuthIntroSection 
          title="Log In" 
          description="Log into your account"
          headingId="login-heading"
        />
      </header>
      
      <section className="mt-10 space-y-8" aria-label="Login options">
        <AuthLoginForm />
        
        <TextSeparator label="or" />
        
        <AuthSocialLoginSection />
        
        <nav className="text-center" aria-label="Account navigation">
          <TextLink
            label="Don't have an account yet? Sign up"
            href={ROUTES.AUTH.SIGNUP}
          />
        </nav>
      </section>
    </article>
  );
}
