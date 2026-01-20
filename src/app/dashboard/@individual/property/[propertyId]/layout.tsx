import { ReactNode } from "react";
import { getCachedPropertyPermissions } from "@/lib/cached-fetchers";
import { PermissionsProvider } from "@/components/common/permissions-provider";

interface PropertyLayoutProps {
  children: ReactNode;
  params: Promise<{ propertyId: string }>;
}

export default async function PropertyLayout({
  children,
  params,
}: PropertyLayoutProps) {
  const { propertyId } = await params;
  const permissionsResult = await getCachedPropertyPermissions(propertyId);
  const capabilities = permissionsResult.success ? permissionsResult.data : [];

  return (
    <PermissionsProvider capabilities={capabilities}>
      {children}
    </PermissionsProvider>
  );
}
