import { Suspense } from "react";
import { PropertyDetailsPage } from "./property-details-page";
import { PropertyDetailsSkeleton } from "./property-details-skeleton";
import { UserTypeConfig, UserType } from "../types/property-details.types";
import { getPropertyDetailsData } from "../api/property-details.actions";

interface PropertyDetailsContainerProps {
  config: UserTypeConfig;
  userType: UserType;
  propertyId: string;
}

async function PropertyDetailsContent({
  config,
  userType,
  propertyId,
}: PropertyDetailsContainerProps) {
  const { property, propertyAccess } = await getPropertyDetailsData(
    propertyId,
    userType
  );

  return (
    <PropertyDetailsPage
      config={config}
      userType={userType}
      propertyId={propertyId}
      initialProperty={property.success ? property.data : null}
      initialPropertyAccess={
        propertyAccess?.success ? propertyAccess.data : null
      }
    />
  );
}

export function PropertyDetailsContainer({
  config,
  userType,
  propertyId,
}: PropertyDetailsContainerProps) {
  return (
    <Suspense fallback={<PropertyDetailsSkeleton />}>
      <PropertyDetailsContent
        config={config}
        userType={userType}
        propertyId={propertyId}
      />
    </Suspense>
  );
}
