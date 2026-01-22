import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CollectionDetailsHeader } from "@/features/collection-details/components/collection-details-header";
import { ItemsTable } from "@/features/collection-details/components/items-table/items-table";
import { CollectionDetailsSkeleton } from "@/features/collection-details/components/collection-details-skeleton";
import { DuplicatesSection } from "@/features/collection-details/components/duplicates-section";
import { getCachedCollectionById } from "@/lib/cached-fetchers";
import { getItems } from "@/features/collection-details/api/item.actions";
import { getBrands } from "@/features/collection-details/api/brand.actions";
import { getCategories } from "@/features/collection-details/api/category.actions";
import { Skeleton } from "@/components/ui/skeleton";

interface CollectionPageProps {
  params: Promise<{ propertyId: string; collectionId: string }>;
  searchParams: Promise<{ unitId?: string }>;
}

async function CollectionHeader({
  propertyId,
  collectionId,
  unitId,
}: {
  propertyId: string;
  collectionId: string;
  unitId: string;
}) {
  const collectionResult = await getCachedCollectionById(
    propertyId,
    collectionId,
    unitId
  );

  if (!collectionResult.success) {
    notFound();
  }

  return (
    <>
      <CollectionDetailsHeader
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
        collection={collectionResult.data}
      />
      <DuplicatesSection
        dupeGroups={collectionResult.data.dupe_groups ?? []}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
      />
    </>
  );
}

function CollectionHeaderSkeleton() {
  return (
    <div className="p-2.5">
      <div className="relative w-full min-h-[220px]">
        <Skeleton className="w-full min-h-[220px] rounded-lg" />
      </div>
    </div>
  );
}

async function CollectionItems({
  propertyId,
  collectionId,
  unitId,
}: {
  propertyId: string;
  collectionId: string;
  unitId: string;
}) {
  const [collectionResult, itemsResult, brandsResult, categoriesResult] =
    await Promise.all([
    getCachedCollectionById(propertyId, collectionId, unitId),
    getItems(propertyId, unitId, collectionId, {
      limit: 10,
      page: 1,
    }),
    getBrands(propertyId, unitId),
    getCategories(propertyId, unitId),
  ]);

  if (!collectionResult.success) {
    notFound();
  }

  const itemsData = itemsResult.success ? itemsResult.data : null;
  const brands = brandsResult.success ? brandsResult.data.data : [];
  const categories = categoriesResult.success ? categoriesResult.data.data : [];

  return (
    <ItemsTable
      propertyId={propertyId}
      unitId={unitId}
      collectionId={collectionId}
      collectionName={collectionResult.data.name}
      initialItems={itemsData?.data ?? []}
      initialBrands={brands}
      initialCategories={categories}
      initialPagination={{
        currentPage: itemsData?.current_page ?? 1,
        pageSize: itemsData?.page_size ?? 10,
        totalPages: itemsData?.total_pages ?? 1,
        totalItems: itemsData?.total_items ?? 0,
      }}
    />
  );
}

function CollectionItemsSkeleton() {
  return (
    <div className="flex-1 min-h-0 px-2.5 pb-2.5">
      <div className="h-full flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex-1 rounded-md border border-border bg-background">
          <div className="space-y-2 px-4 py-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function CollectionContent({
  propertyId,
  collectionId,
  unitId,
}: {
  propertyId: string;
  collectionId: string;
  unitId: string;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-2.5 pt-2.5">
        <Suspense fallback={<CollectionHeaderSkeleton />}>
          <CollectionHeader
            propertyId={propertyId}
            collectionId={collectionId}
            unitId={unitId}
          />
        </Suspense>
      </div>
      <Suspense fallback={<CollectionItemsSkeleton />}>
        <CollectionItems
          propertyId={propertyId}
          collectionId={collectionId}
          unitId={unitId}
        />
      </Suspense>
    </div>
  );
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { propertyId, collectionId } = await params;
  const { unitId } = await searchParams;

  if (!unitId) {
    console.error("[CollectionPage] unitId is missing! searchParams:", searchParams);
    notFound();
  }

  return (
    <Suspense fallback={<CollectionDetailsSkeleton />}>
      <CollectionContent
        propertyId={propertyId}
        collectionId={collectionId}
        unitId={unitId}
      />
    </Suspense>
  );
}
