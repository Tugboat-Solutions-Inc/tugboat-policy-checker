"use client";

import { cn } from "@/lib/utils";
import Logo from "@/components/common/logo";

export function OnboardingIntroSection({
  title,
  description,
  currentStep,
  totalSteps,
}: {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div>
      <Logo className="h-6 mb-24" />

      {/* Step Indicator */}
      <div className="inline-flex items-center h-6 gap-2 rounded-[8px] bg-muted p-3 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;

          return (
            <span
              key={i}
              className={cn(
                "h-0.5 rounded-full transition-all duration-300",
                isActive
                  ? "bg-foreground w-[18px]"
                  : "bg-muted-foreground-2 w-1.5"
              )}
            />
          );
        })}
      </div>

      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <p className="text-base font-regular text-muted-foreground pr-5">
        {description}
      </p>
    </div>
  );
}
