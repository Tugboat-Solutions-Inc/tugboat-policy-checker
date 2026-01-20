import { getCachedProperties } from "@/lib/cached-fetchers";
import { PropertiesKpiSection } from "@/features/company-dashboard/components/properties-section/properties-kpi-section";
import { PropertiesTableWrapper } from "@/features/company-dashboard/components/properties-section/properties-table-wrapper";
import { CompanyLastUploadsSection } from "@/features/company-dashboard/components/company-last-uploads-section";
import { EmptyPropertyState } from "@/features/dashboard/components/empty-property-state";
import { SuperadminSelectUserState } from "@/features/dashboard/components/superadmin-select-user-state";
import { getDecodedJWT } from "@/lib/auth";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";

export default async function CompanyDashboardPage() {
  const decodedToken = await getDecodedJWT();
  const impersonatedUserId = await getImpersonatedUserId();

  if (decodedToken?.role === "ADMIN" && !impersonatedUserId) {
    return <SuperadminSelectUserState />;
  }

  const propertiesResult = await getCachedProperties();

  const owned = propertiesResult.success ? propertiesResult.data.owned : [];
  const shared = propertiesResult.success ? propertiesResult.data.shared : [];
  const allProperties = [...owned, ...shared];
  const hasNoProperties = allProperties.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      <PropertiesKpiSection owned={owned} shared={shared} />
      <div className="flex-1 min-h-0 px-6 pb-6">
        {hasNoProperties ? (
          <EmptyPropertyState />
        ) : (
          <PropertiesTableWrapper properties={allProperties} />
        )}
      </div>
      {allProperties.some(
        (property) => property.last_uploads && property.last_uploads.length > 0
      ) && <CompanyLastUploadsSection properties={allProperties} />}
    </div>
  );
}
