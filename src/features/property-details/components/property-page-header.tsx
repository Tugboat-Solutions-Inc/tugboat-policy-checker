"use client";

import Header from "@/components/common/header/header";
import { ExportButton } from "@/components/common/header/export-button";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { Collection } from "@/features/collection-details/types/collection.types";

interface PropertyPageHeaderProps {
  collections: Collection[];
  propertyId?: string;
  unitId?: string;
  initialFavorite?: boolean;
}

export function PropertyPageHeader({
  collections,
  propertyId,
  unitId,
  initialFavorite = false,
}: PropertyPageHeaderProps) {
  const { can } = usePermissions();

  return (
    <Header title={"Dashboard"} classname="mb-4">
      <div className="flex items-center gap-3">
        {can(CAPABILITIES.EDIT_PROPERTY) && propertyId && unitId && (
          <ExportButton
            collections={collections}
            propertyId={propertyId}
            unitId={unitId}
          />
        )}
      </div>
    </Header>
  );
}
