import { UnitsTable } from "./units-table";
import type { PropertyUnit, Access } from "@/features/auth/types/property.types";
import type { Unit } from "./units-table-columns";

interface UnitsTableWrapperProps {
  propertyId: string;
  units: PropertyUnit[] | null;
  accesses: Access[] | null;
}

function mapPropertyUnitsToUnits(
  propertyId: string,
  propertyUnits: PropertyUnit[] | null,
  accesses: Access[] | null
): Unit[] {
  if (!propertyUnits) return [];

  return propertyUnits.map((unit) => {
    const tenantCount = accesses
      ? accesses.filter(
          (access) => access.unit_id === unit.id && access.is_client === true
        ).length
      : 0;

    return {
      id: unit.id,
      propertyId,
      unitName: unit.name,
      tenants: tenantCount,
    };
  });
}

export function UnitsTableWrapper({
  propertyId,
  units,
  accesses,
}: UnitsTableWrapperProps) {
  const mappedUnits = mapPropertyUnitsToUnits(propertyId, units, accesses);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <UnitsTable propertyId={propertyId} units={mappedUnits} />
    </div>
  );
}
