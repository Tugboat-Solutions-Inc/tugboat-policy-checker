import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DashboardCollectionsSection } from "@/features/dashboard/components/dashboard-collections-section";
import { DashboardLastUploadsSection } from "@/features/dashboard/components/dashboard-last-uploads-section";
import { CompanyPropertyKpisSection } from "@/features/company-dashboard/components/company-property-kpis-section";
import { SelectedPropertyStoreInitializer } from "@/components/common/selected-property-store-initializer";
import { PropertyPageHeader } from "@/features/property-details/components/property-page-header";
import { PropertyPageSkeleton } from "@/features/property-details/components/property-page-skeleton";
import {
  getCachedPropertyById,
  getCachedCollections,
} from "@/lib/cached-fetchers";
import { getFirstUnitId } from "@/lib/utils";
import EmptyState from "@/components/common/empty-state";

interface CompanyPropertyPageProps {
  params: Promise<{
    propertyId: string;
  }>;
}

async function PropertyContent({ propertyId }: { propertyId: string }) {
  const propertyResponse = await getCachedPropertyById(propertyId);

  if (!propertyResponse.success) {
    notFound();
  }

  const property = propertyResponse.data;
  const firstUnitId = getFirstUnitId(property);

  if (!firstUnitId) {
    return (
      <>
        <SelectedPropertyStoreInitializer propertyId={propertyId} />
        <div className="overflow-x-hidden">
          <div className="px-6 py-5">
            <PropertyPageHeader collections={[]} />
            <CompanyPropertyKpisSection
              kpis={{
                totalValue: 0,
                totalItems: 0,
                averageValue: 0,
                collectionsCount: 0,
              }}
            />
          </div>
          <div className="px-6 py-12">
            <EmptyState
              title="No units available"
              subtitle="This property doesn't have any units yet, or you don't have access to any units."
            />
          </div>
        </div>
      </>
    );
  }

  const collectionsResponse = await getCachedCollections(
    propertyId,
    firstUnitId
  );

  const collections = collectionsResponse.success
    ? collectionsResponse.data.data
    : [];

  const kpis = {
    totalValue: property.total_value,
    totalItems: property.total_items,
    averageValue: property.avg_value,
    collectionsCount: collections.length,
  };

  return (
    <>
      <SelectedPropertyStoreInitializer propertyId={propertyId} />
      <div className="overflow-x-hidden flex flex-col h-full">
        <div className="px-6 py-5">
          <PropertyPageHeader
            collections={collections}
            propertyId={propertyId}
            unitId={firstUnitId}
            initialFavorite={property.favorite}
          />
          <CompanyPropertyKpisSection kpis={kpis} />
        </div>
        <DashboardCollectionsSection
          collections={collections}
          property={property}
        />
        {collections.length > 0 && (
          <DashboardLastUploadsSection
            collections={collections}
            property={property}
          />
        )}
      </div>
    </>
  );
}

export default async function CompanyPropertyPage({
  params,
}: CompanyPropertyPageProps) {
  const { propertyId } = await params;

  return (
    <Suspense fallback={<PropertyPageSkeleton />}>
      <PropertyContent propertyId={propertyId} />
    </Suspense>
  );
}
