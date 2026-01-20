"use client";

import { Button } from "@/components/ui/button";

interface ImportModalFooterProps {
  isValid: boolean;
  isSubmitting: boolean;
  isParsing: boolean;
  hasErrors: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onDownloadSample: () => void;
}

export function ImportModalFooter({
  isValid,
  isSubmitting,
  isParsing,
  hasErrors,
  onCancel,
  onSubmit,
  onDownloadSample,
}: ImportModalFooterProps) {
  const isUploadDisabled = !isValid || isSubmitting || isParsing || hasErrors;

  return (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        size="default"
        onClick={onDownloadSample}
        className="text-primary hover:text-primary/90 px-0"
        type="button"
      >
        Download sample CSV
      </Button>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="default"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="default"
          onClick={onSubmit}
          disabled={isUploadDisabled}
          loading={isSubmitting || isParsing}
          type="button"
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
