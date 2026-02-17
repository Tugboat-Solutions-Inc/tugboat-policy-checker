import DashboardLayout from "@/components/common/dashboard-layout";
import { getUserAccountType, getDecodedJWT } from "@/lib/auth";
import { getCachedProperties, getCachedOrganizationById } from "@/lib/cached-fetchers";
import type {
  GetPropertiesResponse,
  Property,
} from "@/features/auth/types/property.types";

export default async function DashboardRootLayout({
  children,
  company,
  individual,
  multiTenant,
}: {
  children: React.ReactNode;
  company: React.ReactNode;
  individual: React.ReactNode;
  multiTenant: React.ReactNode;
}) {
  const [accountType, decodedToken] = await Promise.all([
    getUserAccountType(),
    getDecodedJWT(),
  ]);

  const primaryOrg = decodedToken?.orgs?.find((org) => org.org_type !== "INDIVIDUAL")
    ?? decodedToken?.orgs?.find((org) => org.owner)
    ?? decodedToken?.orgs?.[0];

  const isCompanyClient = 
    accountType === "COMPANY" && 
    primaryOrg?.is_client === true;

  let content = children;

  if (accountType === "COMPANY" && !isCompanyClient) {
    content = company;
  } else if (accountType === "INDIVIDUAL" || isCompanyClient) {
    content = individual;
  } else if (accountType === "MULTI_TENANT") {
    content = multiTenant;
  }

  let properties: GetPropertiesResponse | null = null;

  if (
    (accountType === "MULTI_TENANT" || (accountType === "COMPANY" && !isCompanyClient)) &&
    primaryOrg?.org_id
  ) {
    const organizationId = primaryOrg.org_id;
    const orgResult = await getCachedOrganizationById(organizationId);
    if (orgResult.success) {
      properties = {
        owned: orgResult.data.properties as unknown as Property[],
        shared: [],
      };
    }
  } else {
    const propertiesResult = await getCachedProperties();
    properties = propertiesResult.success ? propertiesResult.data : null;
  }

  return (
    <DashboardLayout
      accountType={isCompanyClient ? "INDIVIDUAL" : accountType}
      properties={properties}
      decodedToken={decodedToken}
      isCompanyClient={isCompanyClient}
    >
      {content}
    </DashboardLayout>
  );
}
