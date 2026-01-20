import { PropertyDetailsContainer } from "@/features/property-details/components/property-details-container";
import { PROPERTY_DETAIL_CONFIG } from "@/features/property-details/config/property-details.config";
import { USER_TYPES } from "@/constants/user-types";
import { SelectedPropertyStoreInitializer } from "@/components/common/selected-property-store-initializer";

interface CompanyPropertyDetailsPageProps {
  params: Promise<{
    propertyId: string;
  }>;
}

export default async function CompanyPropertyDetailsPage({
  params,
}: CompanyPropertyDetailsPageProps) {
  const { propertyId } = await params;
  const userType = USER_TYPES.COMPANY;
  const config = PROPERTY_DETAIL_CONFIG[userType];

  return (
    <>
      <SelectedPropertyStoreInitializer propertyId={propertyId} />
      <PropertyDetailsContainer
        config={config}
        userType={userType}
        propertyId={propertyId}
      />
    </>
  );
}
