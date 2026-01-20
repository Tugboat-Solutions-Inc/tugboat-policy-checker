import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { Property } from "@/features/auth/types/property.types";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";

export function useSelectedPropertyId(): string | null {
  const pathname = usePathname();
  const { selectedPropertyId: storedPropertyId, isHydrated } = useSelectedPropertyStore();

  return useMemo(() => {
    const propertyMatch = pathname.match(/\/property\/([^/]+)/);
    const urlPropertyId = propertyMatch?.[1] || null;
    
    if (urlPropertyId) {
      return urlPropertyId;
    }
    
    if (isHydrated && storedPropertyId) {
      return storedPropertyId;
    }
    
    return null;
  }, [pathname, storedPropertyId, isHydrated]);
}

export function useSelectedProperty(
  ownedProperties: Property[],
  sharedProperties: Property[]
): Property | null {
  const selectedPropertyId = useSelectedPropertyId();
  const propertyMetadata = useSelectedPropertyStore((state) => state.propertyMetadata);

  return useMemo(() => {
    if (!selectedPropertyId) return null;
    const allProperties = [...ownedProperties, ...sharedProperties];
    const property = allProperties.find((p) => p.id === selectedPropertyId) || null;
    
    if (!property) return null;
    
    const metadata = propertyMetadata[selectedPropertyId];
    if (metadata) {
      return {
        ...property,
        name: metadata.name,
        address: metadata.address,
      };
    }
    
    return property;
  }, [selectedPropertyId, ownedProperties, sharedProperties, propertyMetadata]);
}
