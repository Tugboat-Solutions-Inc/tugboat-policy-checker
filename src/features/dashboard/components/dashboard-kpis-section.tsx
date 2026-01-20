import { ChartLine, HandCoins, Package } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";

type DashboardKpisSectionProps = {
  userItems: Array<{ est_cost: number }>;
  collectionsCount: number;
};

export function DashboardKpisSection({
  userItems,
  collectionsCount,
}: DashboardKpisSectionProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        variant="default"
        label="Total Items"
        value={userItems.length}
        description={`Across ${collectionsCount} collections`}
        icon={<Package className="h-4 w-4 text-teal-600" />}
      />
      <KpiCard
        variant="default"
        label="Total Value"
        value={
          userItems
            ? `$${userItems
                .reduce((total, item) => total + item.est_cost, 0)
                .toLocaleString()}`
            : "$0"
        }
        description="Estimated replacement cost"
        icon={<HandCoins className="h-4 w-4 text-teal-600" />}
      />
      <KpiCard
        variant="default"
        label="Average Value"
        value={
          userItems.length > 0
            ? `$${Math.round(
                userItems.reduce((total, item) => total + item.est_cost, 0) /
                  userItems.length
              ).toLocaleString()}`
            : "$0"
        }
        description="Per item"
        icon={<ChartLine className="h-4 w-4 text-teal-600" />}
      />
    </div>
  );
}
