import { Skeleton } from "@/components/ui/skeleton";

export function PropertyDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-8 px-3 sm:px-6 py-4 sm:py-5 h-full overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    </div>
  );
}
