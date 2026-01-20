import * as React from "react";

interface UploadVideoErrorBannerProps {
  errorMessage: string | null;
}

export function UploadVideoErrorBanner({
  errorMessage,
}: UploadVideoErrorBannerProps) {
  if (!errorMessage) return null;

  return (
    <div className="mb-4 rounded-lg border border-red-500 bg-red-50 p-4">
      <h4 className="mb-2 font-semibold text-red-800">Error:</h4>
      <pre className="whitespace-pre-wrap text-sm text-red-700">
        {errorMessage}
      </pre>
    </div>
  );
}

