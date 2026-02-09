import { AuthIntroSection } from "@/features/auth/components/auth-intro-section";
import { InviteIntroSection } from "@/features/auth/components/invite-intro-section";
import AuthSignupForm from "@/features/auth/components/auth-signup-form";
import AuthSocialLoginSection from "@/features/auth/components/auth-social-login-section";
import TextSeparator from "@/components/common/text-separator";
import { getInviteByToken } from "@/features/invites/api/invite.actions";
import type { Invite } from "@/features/invites/types/invite.types";

interface SignupPageProps {
  searchParams: Promise<{ invite_token?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { invite_token } = await searchParams;

  let invite: Invite | null = null;

  if (invite_token) {
    const result = await getInviteByToken(invite_token);
    if (result.success) {
      invite = result.data;
    }
  }

  return (
    <article aria-labelledby="signup-heading">
      <header>
        {invite ? (
          <InviteIntroSection invite={invite} headingId="signup-heading" />
        ) : (
          <AuthIntroSection
            title="Get Started"
            description="Create your Tugboat account"
            headingId="signup-heading"
          />
        )}
      </header>
      
      <section className="mt-6 md:mt-10 space-y-6 md:space-y-8" aria-label="Sign up options">
        {!invite && (
          <>
            <AuthSocialLoginSection inviteToken={invite_token} />
            <TextSeparator label="or" />
          </>
        )}
        <AuthSignupForm
          inviteToken={invite_token}
          inviteEmail={invite?.email}
        />
      </section>
    </article>
  );
}
