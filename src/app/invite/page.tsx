import { redirect } from "next/navigation";
import { getInviteByToken } from "@/features/invites/api/invite.actions";
import { InviteErrorPage } from "@/features/invites/components/invite-error-page";
import { getInviteStatus } from "@/features/invites/types/invite.types";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/config/routes";

interface InvitePageProps {
  searchParams: Promise<{
    token?: string;
    inviteToken?: string;
  }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const token = params.token || params.inviteToken;

  if (!token) {
    return (
      <InviteErrorPage
        title="Invalid Invite Link"
        message="This invite link is missing a token. Please check your email for the complete invite link."
      />
    );
  }

  const result = await getInviteByToken(token);

  if (!result.success) {
    return <InviteErrorPage message={result.message} />;
  }

  const invite = result.data;
  const status = getInviteStatus(invite);

  if (status === "EXPIRED") {
    return (
      <InviteErrorPage
        title="Invite Expired"
        message="This invite has expired. Please request a new invite from the person who sent it."
      />
    );
  }

  if (status === "ACCEPTED") {
    return (
      <InviteErrorPage
        title="Invite Already Used"
        message="This invite has already been accepted. You can go to the dashboard to access your properties."
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(ROUTES.DASHBOARD.ROOT);
  }

  redirect(ROUTES.AUTH.SIGNUP_WITH_INVITE(token));
}
