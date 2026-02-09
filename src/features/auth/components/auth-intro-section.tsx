"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
        className="text-2xl md:text-3xl font-bold mb-2 md:mb-3"
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
