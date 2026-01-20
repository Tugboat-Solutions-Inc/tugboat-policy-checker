"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import type { TableProperty } from "../types/company-dashboard.types";

interface PropertyNameCellProps {
  property: TableProperty;
  showButton?: boolean;
}

export function PropertyNameCell({ property, showButton }: PropertyNameCellProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(ROUTES.DASHBOARD.PROPERTY(property.id));
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
          View
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="text-left text-foreground hover:underline hover:text-primary focus:outline-none focus:underline transition-colors cursor-pointer"
    >
      {property.propertyName}
    </button>
  );
}

