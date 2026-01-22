"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";

function InviteErrorContent({ error }: { error: Error & { digest?: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("inviteToken");

  useEffect(() => {
    console.error("Invite error:", error);
    
    if (token) {
      router.replace(ROUTES.AUTH.SIGNUP_WITH_INVITE(token));
    } else {
      router.replace(ROUTES.AUTH.SIGNUP);
    }
  }, [error, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function InviteError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <InviteErrorContent error={error} />
    </Suspense>
  );
}
