import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Property } from "@/features/auth/types/property.types";

interface PropertyListItemProps {
  property: Property;
  isSelected: boolean;
  onSelect: (property: Property) => void;
  onHover?: (property: Property) => void;
}

export function PropertyListItem({
  property,
  isSelected,
  onSelect,
  onHover,
}: PropertyListItemProps) {
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
        <p className="text-sm font-semibold">{property.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {property.address}
        </p>
      </div>
      {isSelected && <Check className="text-primary" size={16} />}
    </DropdownMenuItem>
  );
}

