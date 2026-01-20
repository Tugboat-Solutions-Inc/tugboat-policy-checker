import { Skeleton } from "@/components/ui/skeleton";

export function DataTableLoading() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex flex-col gap-5 h-full">
        {/* Header skeleton */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border border-border bg-background flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <div className="space-y-2 px-4 py-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between shrink-0">
          <Skeleton className="h-3 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8" />
              ))}
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
