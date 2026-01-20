import { Skeleton } from "@/components/ui/skeleton";

export function UnitDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-6 py-5 h-full overflow-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-3">
        {/* Overview section skeleton */}
        <div className="bg-accent border border-accent-border rounded-lg p-3">
          <div className="flex items-start justify-between gap-8">
            <div className="flex flex-col gap-1.5 w-[345px]">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Tenant Management section skeleton */}
        <div className="bg-accent border border-accent-border rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-80" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>

            <div className="flex flex-col gap-3 w-[560px]">
              {/* Tenant row skeletons */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background border border-input rounded-lg h-12 px-2 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-8 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

