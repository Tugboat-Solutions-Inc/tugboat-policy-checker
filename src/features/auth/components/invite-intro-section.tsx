"use client";

import Link from "next/link";
import { ROUTES } from "@/config/routes";
import Logo from "@/components/common/logo";
import { GalleryVerticalEnd } from "lucide-react";
import type { Invite } from "@/features/invites/types/invite.types";
import { env } from "@/lib/env";

interface InviteIntroSectionProps {
  invite: Invite;
  headingId?: string;
}

export function InviteIntroSection({ invite, headingId }: InviteIntroSectionProps) {
  const organizationName = invite.organization?.name || "the organization";
  const organizationLogoUrl = invite.organization?.logo_url;

  return (
    <hgroup>
      <Link 
        href={ROUTES.HOME} 
        aria-label="Go to Tugboat homepage"
        className="inline-block mb-24 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <Logo className="h-7" aria-hidden="true" />
        <span className="sr-only">Tugboat</span>
      </Link>

      <figure className="mb-5" aria-hidden="true">
        {organizationLogoUrl ? (
          <img
            src={env.NEXT_PUBLIC_STORAGE_URL + organizationLogoUrl}
            alt=""
            className="size-[52px] rounded-[13px] object-cover"
          />
        ) : (
          <span 
            className="flex items-center justify-center size-[52px] bg-foreground rounded-[13px]"
            role="img"
            aria-label={`${organizationName} logo placeholder`}
          >
            <GalleryVerticalEnd className="size-[26px] text-background" aria-hidden="true" />
          </span>
        )}
      </figure>

      <h1 
        id={headingId}
        className="text-3xl font-semibold mb-3"
      >
        Join {organizationName}!
      </h1>
      
      <p className="text-base font-regular text-muted-foreground">
        You have been invited to join <strong className="font-medium">{organizationName}</strong>. 
        Please create an account to accept the invitation.
      </p>
    </hgroup>
  );
}
