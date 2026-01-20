import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kpiCardVariants = cva(
  "rounded-[10px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] text-card-foreground",
  {
    variants: {
      variant: {
        default: "flex flex-col gap-2 px-4 py-3",
        compact: "flex items-center gap-3 px-3 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type KpiCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof kpiCardVariants> & {
    label: string;
    value: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
  };

export function KpiCard({
  label,
  value,
  description,
  icon,
  variant = "default",
  className,
  ...props
}: KpiCardProps) {
  if (variant === "compact") {
    return (
      <div className={cn(kpiCardVariants({ variant, className }))} {...props}>
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
            {icon}
          </div>
        ) : null}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm text-muted-foreground truncate">{label}</span>
          <span className="text-2xl font-semibold truncate">{value}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(kpiCardVariants({ variant, className }))} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
            {icon}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
      </div>
    </div>
  );
}
