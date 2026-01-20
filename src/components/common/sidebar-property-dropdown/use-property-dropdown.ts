import { useCallback, useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Property } from "@/features/auth/types/property.types";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";
import { ROUTES } from "@/config/routes";

export function usePropertyDropdown(sharedProperties: Property[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const setSelectedPropertyId = useSelectedPropertyStore(
    (state) => state.setSelectedPropertyId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProperties = useMemo(() => {
    if (!debouncedQuery.trim()) return sharedProperties;

    const query = debouncedQuery.toLowerCase();
    return sharedProperties.filter((property) =>
      property.name.toLowerCase().includes(query)
    );
  }, [sharedProperties, debouncedQuery]);

  const handlePropertySelect = useCallback(
    (property: Property) => {
      setSelectedPropertyId(property.id);
      startTransition(() => {
        if (pathname.includes("/property/") && pathname.includes("/details")) {
          router.push(ROUTES.DASHBOARD.PROPERTY_DETAILS(property.id));
        } else {
          router.push(ROUTES.DASHBOARD.PROPERTY(property.id));
        }
      });
    },
    [pathname, router, setSelectedPropertyId]
  );

  const handlePropertyHover = useCallback(
    (property: Property) => {
      if (pathname.includes("/property/") && pathname.includes("/details")) {
        router.prefetch(ROUTES.DASHBOARD.PROPERTY_DETAILS(property.id));
      } else {
        router.prefetch(ROUTES.DASHBOARD.PROPERTY(property.id));
      }
    },
    [pathname, router]
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredProperties,
    handlePropertySelect,
    handlePropertyHover,
    isPending,
  };
}

