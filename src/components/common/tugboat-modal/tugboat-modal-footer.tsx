"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TugboatModalFooterProps {
  onCancel?: () => void;
  onNext?: () => void;
  onBack?: () => void;
  cancelLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  showNextIcon?: boolean;
  showBackIcon?: boolean;
  isNextDisabled?: boolean;
  isCancelDisabled?: boolean;
  isBackDisabled?: boolean;
  isNextLoading?: boolean;
  className?: string;
  maxFiles?: number;
  currentFiles?: number;
}

export function TugboatModalFooter({
  onCancel,
  onNext,
  onBack,
  cancelLabel = "Cancel",
  nextLabel = "Next Step",
  backLabel = "Back",
  showNextIcon = true,
  showBackIcon = true,
  isNextDisabled = false,
  isCancelDisabled = false,
  isBackDisabled = false,
  isNextLoading = false,
  className,
  maxFiles,
  currentFiles,
}: TugboatModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className,
        maxFiles !== undefined && currentFiles !== undefined
          ? "w-full justify-between"
          : "justify-end"
      )}
    >
      {maxFiles !== undefined && currentFiles !== undefined && (
        <div className="flex flex-row items-center gap-5">
          <p className="text-sm font-medium text-foreground">Uploaded</p>
          <p className="text-sm text-muted-foreground">
            {currentFiles}/{maxFiles}
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isBackDisabled}
            className="h-10 rounded-lg text-foreground bg-accent-border px-4 font-medium"
          >
            {showBackIcon && <ChevronLeft className="mr-1 size-4" />}
            {backLabel}
          </Button>
        ) : onCancel ? (
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isCancelDisabled}
            className="h-10 rounded-lg text-foreground bg-accent-border px-4 font-medium"
          >
            {cancelLabel}
          </Button>
        ) : null}
        {onNext && (
          <Button
            onClick={onNext}
            disabled={isNextDisabled}
            loading={isNextLoading}
            className="h-10 rounded-lg bg-[var(--base-brand-brand,#1597b4)] px-4 font-medium text-[var(--base-primary-primary-foreground,#f9fafb)] hover:bg-[var(--base-brand-brand,#1597b4)]/90"
          >
            {nextLabel}
            {showNextIcon && <ChevronRight className="ml-1 size-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
