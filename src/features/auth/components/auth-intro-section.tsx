"use client";

import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

interface AuthIntroSectionProps {
  title: string;
  description: string;
  showBackIcon?: boolean;
  emailHint?: string | null;
  headingId?: string;
}

export function AuthIntroSection({
  title,
  description,
  showBackIcon,
  emailHint,
  headingId,
}: AuthIntroSectionProps) {
  const router = useRouter();

  return (
    <hgroup>
      <Link 
        href={ROUTES.HOME} 
        aria-label="Go to Tugboat homepage"
        className="inline-block mb-24 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <Logo className="h-6" aria-hidden="true" />
        <span className="sr-only">Tugboat</span>
      </Link>
      
      {showBackIcon && (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center mb-6 p-1 -ml-1 rounded-md hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
      )}
      
      <h1 
        id={headingId}
        className="text-3xl font-bold mb-3"
      >
        {title}
      </h1>
      
      <p className="text-base font-regular text-muted-foreground">
        {description}
        {emailHint && (
          <>
            <br />
            <strong className="text-foreground font-normal">{emailHint}</strong>
          </>
        )}
      </p>
    </hgroup>
  );
}
