import Header from "@/components/common/header/header";
import { NavigateBackButton } from "@/components/common/header/navigate-back-button";
import { CollectionListItemSkeleton } from "@/components/common/collection-list-item/collection-list-item-skeleton";

export default function AllUploadsLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="mx-6 mt-5">
        <Header title="All Uploads" leadingButton={<NavigateBackButton />} />
      </div>
      <div className="mx-6 mt-2 mb-7 flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto thin-scrollbar">
        {Array.from({ length: 10 }).map((_, i) => (
          <CollectionListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

