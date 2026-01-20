import { DetailSection } from "@/components/common/detail-section";
import type { Property } from "@/features/auth/types/property.types";
import PropertySetupForm, {
  PropertySetupFormValues,
} from "@/features/auth/components/onboarding/property-setup-form";

interface PropertyOverviewSectionProps {
  property: Property;
  onFormStateChange: (
    isValid: boolean,
    values: PropertySetupFormValues
  ) => void;
  viewOnly?: boolean;
}

export function PropertyOverviewSection({
  property,
  onFormStateChange,
  viewOnly,
}: PropertyOverviewSectionProps) {
  return (
    <DetailSection
      title="Overview"
      description="Manage your property information."
    >
      <div className="flex flex-col gap-4 w-full lg:max-w-[560px]">
        <PropertySetupForm
          initialValues={{
            property_name: property.name,
            property_address: property.address,
            property_id: property.address_place_id,
          }}
          onFormStateChange={onFormStateChange}
          onlyInputs
          viewOnly={viewOnly}
        />
      </div>
    </DetailSection>
  );
}
