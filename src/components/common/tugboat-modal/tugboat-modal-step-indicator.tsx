"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TugboatModalStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function TugboatModalStepIndicator({
  currentStep,
  totalSteps,
  className,
}: TugboatModalStepIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2 rounded-md">
              <div
                className={cn(
                  "size-2.5 rounded-full border-2 transition-all duration-300 ease-out",
                  isActive
                    ? "border-[var(--base-brand-brand,#1597b4)] bg-[var(--base-background,#ffffff)] opacity-100 scale-100"
                    : isCompleted
                      ? "border-[var(--base-brand-brand,#1597b4)] bg-[var(--base-brand-brand,#1597b4)] opacity-90 scale-100"
                      : "border-[var(--base-input,#e5e7eb)] bg-[var(--base-background,#ffffff)] opacity-60 scale-90"
                )}
              />
              <p
                className={cn(
                  "text-sm leading-none transition-all duration-300 ease-out",
                  isActive
                    ? "font-medium text-foreground opacity-100"
                    : "font-normal text-muted-foreground opacity-70"
                )}
              >
                STEP {step}
              </p>
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "h-px w-[38px] bg-[var(--base-input,#e5e7eb)] transition-all duration-300 ease-out",
                  step < currentStep ? "opacity-80" : "opacity-40"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
