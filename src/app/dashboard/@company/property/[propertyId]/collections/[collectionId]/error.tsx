"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Collection page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        We couldn't load this collection. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
