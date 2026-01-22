import { DropdownMenuGroup, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { StatusChip } from "../../ui/status-chip";
import { Property } from "@/features/auth/types/property.types";
import { PropertyListItem } from "./property-list-item";

interface IndividualPropertiesSectionProps {
  ownedProperties: Property[];
  sharedProperties: Property[];
  selectedPropertyId?: string;
  onPropertySelect: (property: Property) => void;
  onPropertyHover?: (property: Property) => void;
  showUnitNames?: boolean;
}

export function IndividualPropertiesSection({
  ownedProperties,
  sharedProperties,
  selectedPropertyId,
  onPropertySelect,
  onPropertyHover,
  showUnitNames = false,
}: IndividualPropertiesSectionProps) {
  return (
    <div>
      {ownedProperties.length > 0 && (
        <div className="rounded-[12px] bg-white py-2 px-1 border border-foreground/5">
          <DropdownMenuLabel className="pl-1 mb-1">
            <StatusChip
              variant="orange"
              className="px-1.5 py-1 rounded-[6px]"
            >
              Owned
            </StatusChip>
          </DropdownMenuLabel>
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto thin-scrollbar">
            {ownedProperties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                isSelected={selectedPropertyId === property.id}
                onSelect={onPropertySelect}
                onHover={onPropertyHover}
                showUnitName={showUnitNames}
              />
            ))}
          </DropdownMenuGroup>
        </div>
      )}

      {ownedProperties.length > 0 && <div className="h-1" />}

      {sharedProperties.length > 0 && (
        <div className="rounded-[12px] bg-white py-2 px-1 border border-foreground/5 ">
          <DropdownMenuLabel className="pl-1 mb-1">
            <StatusChip
              className="px-1.5 py-1 rounded-[6px]"
              variant="blue"
            >
              Shared
            </StatusChip>
          </DropdownMenuLabel>
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto thin-scrollbar">
            {sharedProperties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                isSelected={selectedPropertyId === property.id}
                onSelect={onPropertySelect}
                onHover={onPropertyHover}
                showUnitName={showUnitNames}
              />
            ))}
          </DropdownMenuGroup>
        </div>
      )}
    </div>
  );
}

