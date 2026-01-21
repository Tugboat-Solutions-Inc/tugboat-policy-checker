import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CollectionDetailsHeader } from "@/features/collection-details/components/collection-details-header";
import { ItemsTable } from "@/features/collection-details/components/items-table/items-table";
import { CollectionDetailsSkeleton } from "@/features/collection-details/components/collection-details-skeleton";
import { DuplicatesSection } from "@/features/collection-details/components/duplicates-section";
import { getCachedPropertyById, getCachedCollectionById } from "@/lib/cached-fetchers";
import { getItems } from "@/features/collection-details/api/item.actions";
import { getFirstUnitId } from "@/lib/utils";

interface CollectionPageProps {
  params: Promise<{ propertyId: string; collectionId: string }>;
}

async function CollectionContent({
  propertyId,
  collectionId,
}: {
  propertyId: string;
  collectionId: string;
}) {
  const propertyResult = await getCachedPropertyById(propertyId);

  if (!propertyResult.success) {
    notFound();
  }

  const unitId = getFirstUnitId(propertyResult.data);
  if (!unitId) {
    notFound();
  }

  const [
    collectionResult,
    itemsResult,
  ] = await Promise.all([
    getCachedCollectionById(propertyId, collectionId, unitId),
    getItems(propertyId, unitId, collectionId, { limit: 10, page: 1 }),
  ]);

  if (!collectionResult.success) {
    notFound();
  }

  const itemsData = itemsResult.success ? itemsResult.data : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-2.5">
        <CollectionDetailsHeader
          propertyId={propertyId}
          unitId={unitId}
          collectionId={collectionId}
          collection={collectionResult.data}
        />
      </div>
      <DuplicatesSection
        dupeGroups={collectionResult.data.dupe_groups ?? []}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
      />
      <div className="flex-1 min-h-0 px-2.5 pb-2.5">
        <ItemsTable
          propertyId={propertyId}
          unitId={unitId}
          collectionId={collectionId}
          collectionName={collectionResult.data.name}
          initialItems={itemsData?.data ?? []}
          initialPagination={{
            currentPage: itemsData?.current_page ?? 1,
            pageSize: itemsData?.page_size ?? 10,
            totalPages: itemsData?.total_pages ?? 1,
            totalItems: itemsData?.total_items ?? 0,
          }}
        />
      </div>
    </div>
  );
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { propertyId, collectionId } = await params;

  return (
    <Suspense fallback={<CollectionDetailsSkeleton />}>
      <CollectionContent propertyId={propertyId} collectionId={collectionId} />
    </Suspense>
  );
}
