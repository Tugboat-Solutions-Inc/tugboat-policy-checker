import { Package } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";
import { HomeIcon, UserIcon } from "@/components/icons";
import type { Property } from "@/features/auth/types/property.types";

interface PropertiesKpiSectionProps {
  owned: Property[];
  shared: Property[];
}

export function PropertiesKpiSection({
  owned,
  shared,
}: PropertiesKpiSectionProps) {
  const allProperties = [...owned, ...shared];

  const totalProperties = allProperties.length;
  const sharedWithClients = allProperties.filter(
    (property) => property.accesses && property.accesses.length > 0
  ).length;
  const totalItems = allProperties.reduce(
    (sum, property) => sum + property.total_items,
    0
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-5 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold leading-none text-foreground">
          Home
        </h1>
      </div>
    <div className="flex gap-3">
      <KpiCard
        variant="compact"
        label="Total Properties"
        value={totalProperties}
        icon={<HomeIcon isActive />}
        className="flex-1 min-w-0"
      />
      <KpiCard
        variant="compact"
        label="Shared with Clients"
        value={sharedWithClients}
        icon={<UserIcon isActive />}
        className="flex-1 min-w-0"
      />
      <KpiCard
        variant="compact"
        label="Total Items"
        value={totalItems.toLocaleString()}
        icon={<Package className="h-4 w-4 text-primary" />}
        className="flex-1 min-w-0"
      />
    </div>
    </div>
  );
}
