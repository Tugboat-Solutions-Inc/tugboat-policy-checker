import { ReactNode } from "react";

interface DetailSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function DetailSection({
  title,
  description,
  children,
  actions,
}: DetailSectionProps) {
  return (
    <div className="bg-accent border border-accent-border rounded-lg p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
        <div className="flex flex-col gap-3 lg:gap-5">
          <div className="flex flex-col w-full lg:w-[345px]">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {actions}
        </div>

        <div className="flex w-full lg:flex-1 lg:justify-end">{children}</div>
      </div>
    </div>
  );
}
