import { Skeleton } from "@/components/ui/skeleton";

export function CollectionCardSkeleton() {
  return (
    <div className="flex w-[208px] flex-col gap-4 rounded-[12px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] p-1 pb-4">
      <Skeleton className="h-[200px] w-[200px] rounded-lg" />
      <div className="flex flex-col gap-1.5 px-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-1 w-1 rounded-full" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      </div>
    </div>
  );
}
