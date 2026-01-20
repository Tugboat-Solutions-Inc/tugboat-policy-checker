import { ChartLine, HandCoins, Package } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";
import type { PropertyKpiData } from "../types/company-dashboard.types";

type CompanyPropertyKpisSectionProps = {
  kpis: PropertyKpiData;
};

export function CompanyPropertyKpisSection({
  kpis,
}: CompanyPropertyKpisSectionProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        variant="default"
        label="Total Items"
        value={kpis.totalItems}
        description={`Across ${kpis.collectionsCount} collections`}
        icon={<Package className="h-4 w-4 text-teal-600" />}
      />
      <KpiCard
        variant="default"
        label="Total Value"
        value={`$${kpis.totalValue.toLocaleString()}`}
        description="Estimated replacement cost"
        icon={<HandCoins className="h-4 w-4 text-teal-600" />}
      />
      <KpiCard
        variant="default"
        label="Average Value"
        value={`$${kpis.averageValue.toLocaleString()}`}
        description="Per item"
        icon={<ChartLine className="h-4 w-4 text-teal-600" />}
      />
    </div>
  );
}

