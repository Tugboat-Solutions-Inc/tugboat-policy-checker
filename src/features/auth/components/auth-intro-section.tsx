"use client";

import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export function AuthIntroSection({
  title,
  description,
  showBackIcon,
  emailHint,
}: {
  title: string;
  description: string;
  showBackIcon?: boolean;
  emailHint?: string | null;
}) {
  const router = useRouter();

  return (
    <div>
      <Link href={ROUTES.HOME} aria-label="Tugboat Home">
        <Logo className="h-6 mb-24" />
      </Link>
      {showBackIcon && (
        <ArrowLeft
          className="size-5 mb-6 cursor-pointer hover:text-primary transition-all"
          onClick={() => router.back()}
        />
      )}
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <p className="text-base font-regular text-muted-foreground">
        {description}
        {emailHint && (
          <>
            <br />
            <span className="text-foreground">{emailHint}</span>
          </>
        )}
      </p>
    </div>
  );
}
