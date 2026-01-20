import { Skeleton } from "@/components/ui/skeleton";
import { CollectionCardSkeleton } from "@/components/common/collection-card/collection-card-skeleton";
import { KpiCardSkeleton } from "@/components/common/kpi-card/kpi-card-skeleton";
import { CollectionListItemSkeleton } from "@/components/common/collection-list-item/collection-list-item-skeleton";

export function PropertyPageSkeleton() {
  return (
    <div className="overflow-x-hidden">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="py-5">
        <div className="px-6 mb-6 flex flex-row justify-between items-center">
          <div className="flex flex-row items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex flex-row gap-3">
            <Skeleton className="h-9 w-[220px] rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>

        <div className="px-6">
          <div className="flex flex-row gap-3 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="mb-4 flex flex-row justify-between">
          <Skeleton className="h-6 w-28" />
          <div className="gap-3 flex flex-row items-center">
            <Skeleton className="h-9 w-20 rounded-[8px]" />
            <Skeleton className="h-9 w-32 rounded-[8px]" />
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-7">
          {[1, 2, 3, 4].map((i) => (
            <CollectionListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
