"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import Logo from "@/components/common/logo";
import { GalleryVerticalEnd } from "lucide-react";
import type { Invite } from "@/features/invites/types/invite.types";
import { env } from "@/lib/env";

interface InviteIntroSectionProps {
  invite: Invite;
}

export function InviteIntroSection({ invite }: InviteIntroSectionProps) {
  const organizationName = invite.organization?.name || "the organization";
  const organizationLogoUrl = invite.organization?.logo_url;

  return (
    <div>
      <Link href={ROUTES.HOME} aria-label="Tugboat Home">
        <Logo className="h-6 mb-24" />
      </Link>

      {organizationLogoUrl ? (
        <div className="size-[52px] rounded-[13px] mb-5 overflow-hidden">
          <img
            src={env.NEXT_PUBLIC_STORAGE_URL + organizationLogoUrl}
            alt={organizationName}
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center size-[52px] bg-foreground rounded-[13px] mb-5">
          <GalleryVerticalEnd className="size-[26px] text-background" />
        </div>
      )}

      <h1 className="text-3xl font-semibold mb-3">
        Join {organizationName}!
      </h1>
      <p className="text-base font-regular text-muted-foreground">
        You have been invited to join {organizationName}. Please create an
        account to accept the invitation.
      </p>
    </div>
  );
}
