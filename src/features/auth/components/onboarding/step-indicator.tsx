import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  totalSteps: number;
  currentStep: number;
};

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="inline-flex items-center h-6 gap-2 rounded-[8px] bg-muted p-3">
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
  );
}
