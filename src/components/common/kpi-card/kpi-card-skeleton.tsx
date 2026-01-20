import { Skeleton } from "@/components/ui/skeleton";

type KpiCardSkeletonProps = {
  variant?: "default" | "compact";
};

export function KpiCardSkeleton({ variant = "default" }: KpiCardSkeletonProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-[10px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] text-card-foreground flex items-center gap-3 px-3 py-2 h-[74px]">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] text-card-foreground flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
