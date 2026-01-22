import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Property } from "@/features/auth/types/property.types";
import { useMemo } from "react";

interface PropertyListItemProps {
  property: Property;
  isSelected: boolean;
  onSelect: (property: Property) => void;
  onHover?: (property: Property) => void;
  showUnitName?: boolean;
}

function getUnitDisplayName(property: Property): string | null {
  if (!property.units || property.units.length === 0) return null;
  const unit = property.units[0];
  if (!unit?.name) return null;
  if (unit.name === "Default" || unit.name === "Default Unit") return null;
  return unit.name;
}

export function PropertyListItem({
  property,
  isSelected,
  onSelect,
  onHover,
  showUnitName = false,
}: PropertyListItemProps) {
  const unitName = useMemo(() => {
    if (!showUnitName) return null;
    return getUnitDisplayName(property);
  }, [showUnitName, property]);

  const displayName = unitName 
    ? `${unitName} (${property.name})`
    : property.name;
  const subtitle = property.address;

  return (
    <DropdownMenuItem
      onClick={() => onSelect(property)}
      onMouseEnter={() => onHover?.(property)}
      className={cn(
        "p-2.5 mb-1 rounded-[8px] flex justify-between items-center",
        isSelected
          ? "bg-sidebar-accent hover:bg-sidebar-accent!"
          : "hover:bg-sidebar-accent!"
      )}
    >
      <div className="max-w-3/4">
        <p className="text-sm font-semibold">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {subtitle}
        </p>
      </div>
      {isSelected && <Check className="text-primary" size={16} />}
    </DropdownMenuItem>
  );
}

