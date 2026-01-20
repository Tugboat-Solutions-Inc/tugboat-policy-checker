import { Suspense } from "react";
import { notFound } from "next/navigation";
import { UnitDetailsWrapper } from "@/features/tenant-dashboard/components/unit-details/unit-details-wrapper";
import { UnitDetailsSkeleton } from "@/features/tenant-dashboard/components/unit-details/unit-details-skeleton";
import { getCachedPropertyById } from "@/lib/cached-fetchers";

interface UnitDetailsPageProps {
  params: Promise<{ propertyId: string; unitId: string }>;
}

async function UnitDetailsContent({
  propertyId,
  unitId,
}: {
  propertyId: string;
  unitId: string;
}) {
  const propertyResponse = await getCachedPropertyById(propertyId);

  if (!propertyResponse.success) {
    notFound();
  }

  const property = propertyResponse.data;
  const unit = property.units.find((u) => u.id === unitId);

  if (!unit) {
    notFound();
  }

  const unitAccesses = property.accesses?.filter(
    (access) => access.unit_id === unitId
  ) || [];

  return (
    <UnitDetailsWrapper
      propertyId={propertyId}
      unitId={unitId}
      unitName={unit.name}
      accesses={unitAccesses}
    />
  );
}

export default async function UnitDetails({ params }: UnitDetailsPageProps) {
  const { propertyId, unitId } = await params;

  return (
    <Suspense fallback={<UnitDetailsSkeleton />}>
      <UnitDetailsContent propertyId={propertyId} unitId={unitId} />
    </Suspense>
  );
}
