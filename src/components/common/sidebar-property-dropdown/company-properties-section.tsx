import { DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Property } from "@/features/auth/types/property.types";
import { PropertyListItem } from "./property-list-item";

interface CompanyPropertiesSectionProps {
  filteredProperties: Property[];
  selectedPropertyId?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onPropertySelect: (property: Property) => void;
  onPropertyHover?: (property: Property) => void;
}

export function CompanyPropertiesSection({
  filteredProperties,
  selectedPropertyId,
  searchQuery,
  onSearchChange,
  onPropertySelect,
  onPropertyHover,
}: CompanyPropertiesSectionProps) {
  return (
    <div>
      <div className="rounded-[12px] bg-white py-2 px-1 border border-foreground/5">
        <div className="relative pr-2 mb-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground " />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            className="pl-10 shadow-none"
          />
        </div>
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto thin-scrollbar">
          {filteredProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2.5 py-2">
              No properties found...
            </p>
          ) : (
            filteredProperties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                isSelected={selectedPropertyId === property.id}
                onSelect={onPropertySelect}
                onHover={onPropertyHover}
              />
            ))
          )}
        </DropdownMenuGroup>
      </div>
    </div>
  );
}
