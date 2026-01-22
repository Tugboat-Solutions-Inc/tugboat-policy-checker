import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/common/nav-link";
import { ROUTES } from "@/config/routes";

export default function ResetPasswordSuccessPage() {
  return (
    <div className="space-y-10">
      <AuthIntroSection title="Password changed successfully!" description="" />
      <NavLink href={ROUTES.AUTH.LOGIN} className="block">
        <Button variant="default" size="lg" className="h-12 w-full">
          Go to Login
        </Button>
      </NavLink>
    </div>
  );
}
