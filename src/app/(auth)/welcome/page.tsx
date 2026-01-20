import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import AuthSocialLoginSection from "@/features/auth/components/auth-social-login-section";
import TextSeparator from "@/components/common/text-separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function WelcomePage() {
  return (
    <div className="space-y-10">
      <AuthIntroSection
        title="Welcome to Tugboat"
        description="Document every asset, stay organized, and streamline insurance claims"
      />
      <div className="space-y-8">
        <AuthSocialLoginSection />
        <TextSeparator label="or" />
        <div className="gap-3 flex flex-col">
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button variant="default" size="lg" className="w-full h-12">
              Log In
            </Button>
          </Link>
          <Link href={ROUTES.AUTH.SIGNUP}>
            <Button
              variant="secondary"
              size="lg"
              className="w-full h-12 bg-gray-100 cursor-pointer hover:bg-gray-200"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
