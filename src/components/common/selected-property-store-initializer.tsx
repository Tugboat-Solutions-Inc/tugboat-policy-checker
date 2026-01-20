"use client";

import { useEffect } from "react";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";

interface SelectedPropertyStoreInitializerProps {
  propertyId: string;
}

export function SelectedPropertyStoreInitializer({
  propertyId,
}: SelectedPropertyStoreInitializerProps) {
  const { setSelectedPropertyId } = useSelectedPropertyStore();

  useEffect(() => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
  }, [propertyId, setSelectedPropertyId]);

  return null;
}
