import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/common/app-sidebar";
import { AuthStoreInitializer } from "@/components/common/auth-store-initializer";
import { ImpersonationStoreInitializer } from "@/components/common/impersonation-store-initializer";
import { PageTransition } from "@/components/common/page-transition";
import type { GetPropertiesResponse } from "@/features/auth/types/property.types";
import type { DecodedJWT } from "@/features/auth/types/auth-store.types";
import type { AccountType } from "@/lib/auth";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";
import { getUser } from "@/features/auth/api/user.actions";

interface DashboardLayoutProps {
  children: React.ReactNode;
  accountType: AccountType;
  properties: GetPropertiesResponse | null;
  decodedToken: DecodedJWT | null;
  isCompanyClient?: boolean;
}

export default async function DashboardLayout({
  children,
  accountType,
  properties,
  decodedToken,
  isCompanyClient = false,
}: DashboardLayoutProps) {
  const impersonatedUserId = await getImpersonatedUserId();
  const currentUserId = decodedToken?.sub || "";

  let impersonatedUserData = null;
  if (impersonatedUserId) {
    const userResult = await getUser();
    if (userResult.success) {
      impersonatedUserData = userResult.data;
    }
  }

  return (
    <SidebarProvider>
      <AuthStoreInitializer decodedToken={decodedToken} />
      <ImpersonationStoreInitializer
        impersonatedUserId={impersonatedUserId}
        impersonatedUserData={impersonatedUserData}
      />
      <AppSidebar
        accountType={accountType}
        ownedProperties={properties?.owned || []}
        sharedProperties={properties?.shared || []}
        currentUserId={currentUserId}
        impersonatedUserId={impersonatedUserId}
        isCompanyClient={isCompanyClient}
      />
      <SidebarInset className="overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </SidebarInset>
    </SidebarProvider>
  );
}
