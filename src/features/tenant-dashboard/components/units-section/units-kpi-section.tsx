import { Suspense } from "react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";
import { KpiCardSkeleton } from "@/components/common/kpi-card/kpi-card-skeleton";
import { HomeIcon, UserIcon } from "@/components/icons";
import { fetchKpiData } from "../../api/tenant-dashboard.actions";

async function KpiCards() {
  const { totalUnits, sharedUnits } = await fetchKpiData();

  return (
    <div className="flex gap-3">
      <KpiCard
        variant="compact"
        label="Total Units"
        value={totalUnits}
        icon={<HomeIcon isActive />}
        className="flex-1 min-w-0"
      />
      <KpiCard
        variant="compact"
        label="Shared Units"
        value={sharedUnits}
        icon={<UserIcon isActive />}
        className="flex-1 min-w-0"
      />
    </div>
  );
}

export function KpiSection() {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold leading-none text-foreground">
          Dashboard
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <KpiCardSkeleton variant="compact" />
            </div>
            <div className="flex-1 min-w-0">
              <KpiCardSkeleton variant="compact" />
            </div>
          </div>
        }
      >
        <KpiCards />
      </Suspense>
    </div>
  );
}
