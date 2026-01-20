import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { EmptyPropertyState } from "@/features/dashboard/components/empty-property-state";
import { SuperadminSelectUserState } from "@/features/dashboard/components/superadmin-select-user-state";
import { getCachedProperties } from "@/lib/cached-fetchers";
import { getDecodedJWT } from "@/lib/auth";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";

export default async function IndividualDashboardPage() {
  const decodedToken = await getDecodedJWT();
  const impersonatedUserId = await getImpersonatedUserId();

  if (decodedToken?.role === "ADMIN" && !impersonatedUserId) {
    return <SuperadminSelectUserState />;
  }

  const propertiesResult = await getCachedProperties();

  if (!propertiesResult.success) {
    return <EmptyPropertyState />;
  }

  const { owned, shared } = propertiesResult.data;
  const hasNoOwned = !owned || owned.length === 0;
  const hasNoShared = !shared || shared.length === 0;

  if (hasNoOwned && hasNoShared) {
    return <EmptyPropertyState />;
  }

  const firstProperty = owned?.[0] || shared?.[0];

  if (firstProperty) {
    redirect(ROUTES.DASHBOARD.PROPERTY(firstProperty.id));
  }

  return <EmptyPropertyState />;
}
