import { Skeleton } from "@/components/ui/skeleton";

export function CollectionListItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-[var(--base-accent-accent-border,#f3f4f6)] bg-[var(--base-sidebar-sidebar-background,#fcfcfc)] px-4 py-2.5 pl-2.5">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-11">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-[46px] w-[46px] shrink-0 rounded-md" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
