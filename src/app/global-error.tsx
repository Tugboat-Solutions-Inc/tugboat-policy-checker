"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
