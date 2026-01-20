"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UnitTenant } from "../../api/tenant-dashboard.actions";
import { Button } from "@/components/ui/button";
import { UserRoundPlus } from "lucide-react";
import { TenantRow } from "./tenant-row";
import { InviteTenantsModal } from "../invite-tenants-modal/invite-tenants-modal";
import type { InviteTenantsFormValues } from "../../schemas/invite-tenants.schema";
import { DetailSection } from "@/components/common/detail-section";
import { createPropertyAccessInvites, deletePropertyAccess, updatePropertyAccess } from "@/features/invites/api/invite.actions";
import { toast } from "@/components/common/toast/toast";

interface TenantManagementSectionProps {
  tenants: UnitTenant[];
  unitId: string;
  propertyId: string;
}

export function TenantManagementSection({
  tenants,
  unitId,
  propertyId,
}: TenantManagementSectionProps) {
  const router = useRouter();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteUsers = () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async (data: InviteTenantsFormValues) => {
    const invites = data.tenantInvites.map((invite) => ({
      email: invite.email,
      access_type: invite.permission === "edit" ? "EDITOR" as const : "VIEWER" as const,
      is_client: true,
    }));

    const result = await createPropertyAccessInvites(propertyId, unitId, invites);

    if (!result.success) {
      throw new Error(result.message || "Failed to invite tenants");
    }

    router.refresh();
  };

  const handleAccessLevelChange = useCallback(
    async (accessId: string, newAccessLevel: "VIEWER" | "EDITOR") => {
      const result = await updatePropertyAccess(propertyId, accessId, newAccessLevel);

      if (result.success) {
        toast.success("Access updated", "User access level has been updated");
        router.refresh();
      } else {
        toast.error("Failed to update access", result.message || "Please try again");
      }
    },
    [propertyId, router]
  );

  const handleRemoveTenant = useCallback(
    async (accessId: string) => {
      const result = await deletePropertyAccess(propertyId, accessId);

      if (result.success) {
        toast.success("User removed", "User access has been removed successfully");
        router.refresh();
      } else {
        toast.error("Failed to remove user", result.message || "Please try again");
      }
    },
    [propertyId, router]
  );

  return (
    <>
      <InviteTenantsModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onSubmit={handleInviteSubmit}
        unitId={unitId}
      />
      <DetailSection
        title="Tenant Management"
        description="Manage tenant access and permissions for this unit."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInviteUsers}
            className="bg-accent-border hover:bg-accent-border/80 text-foreground h-8 sm:h-9 w-fit text-xs sm:text-sm"
          >
            <UserRoundPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            Invite Tenants
          </Button>
        }
      >
        <div className="flex flex-col gap-2 sm:gap-3 w-full lg:max-w-[560px]">
          {tenants.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No tenants have been added yet
            </div>
          ) : (
            tenants.map((tenant) => (
              <TenantRow
                key={tenant.id}
                tenant={tenant}
                onAccessLevelChange={handleAccessLevelChange}
                onRemove={handleRemoveTenant}
              />
            ))
          )}
        </div>
      </DetailSection>
    </>
  );
}
