"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { Unit } from "./units-section/units-table-columns";

interface UnitNameCellProps {
  unit: Unit;
  showButton?: boolean;
}

export function UnitNameCell({ unit, showButton }: UnitNameCellProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(ROUTES.DASHBOARD.UNIT_DETAILS(unit.propertyId, unit.id));
  };

  if (showButton) {
    return (
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={handleClick}
        >
          Manage
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="text-left text-foreground hover:underline hover:text-primary focus:outline-none focus:underline transition-colors cursor-pointer"
    >
      {unit.unitName}
    </button>
  );
}
