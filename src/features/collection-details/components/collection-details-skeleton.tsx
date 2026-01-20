import { Skeleton } from "@/components/ui/skeleton";

export function CollectionDetailsSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-2.5">
        <div className="relative w-full min-h-[220px] rounded-lg overflow-hidden bg-muted">
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-6 rounded-md bg-white/20" />
              <div className="flex items-center gap-8">
                <Skeleton className="h-5 w-5 rounded bg-white/20" />
                <Skeleton className="h-9 w-9 rounded-lg bg-white/20" />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2 max-w-[552px]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-64 bg-white/20" />
                  <Skeleton className="h-9 w-40 rounded-lg bg-white/20" />
                </div>
                <Skeleton className="h-4 w-96 bg-white/20" />
              </div>

              <div className="flex items-center gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2 w-[120px]">
                    <Skeleton className="h-4 w-16 bg-white/20" />
                    <Skeleton className="h-8 w-12 bg-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-2.5 pb-2.5">
        <div className="h-full flex flex-col min-h-0 bg-background rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="h-9 w-[240px] rounded-md" />
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-md" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>

            <div className="flex-1 min-h-0">
              <div className="border rounded-lg">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b px-4 py-3 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-10 w-10 rounded" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
