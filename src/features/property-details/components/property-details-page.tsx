"use client";

import { useState, useMemo, useCallback, useTransition, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PropertyDetailsHeader } from "./property-details-header";
import { PropertyOverviewSection } from "./property-overview-section";
import { UserManagementSection } from "./user-management-section";
import { UnsavedChangesDialog } from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { toast } from "@/components/common/toast/toast";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { useCurrentUser, useCurrentOrg } from "@/hooks/use-auth";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";
import { ROUTES } from "@/config/routes";
import { getFirstUnitId } from "@/lib/utils";
import { getPropertyById, deleteProperty } from "@/features/auth/api/property.actions";
import { updateProperty } from "../api/property-details.actions";
import { getPropertyAccess, updatePropertyAccess, createPropertyAccess } from "../api/property-access.actions";
import { createUnit } from "@/features/dashboard/api/unit.actions";
import { addOwnerToAccessList } from "../utils/property-access.utils";
import { INVITE_MODAL_CONFIGS } from "@/components/common/invite-modal/config/invite-modal-config";
import { ACCESS_TYPES } from "@/constants/roles.constants";
import type { UserTypeConfig, UserType } from "../types/property-details.types";
import type { propertyAccess, AccessType } from "../types/property-access.types";
import type { Property } from "@/features/auth/types/property.types";
import type { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";

const LazyInviteModal = lazy(() =>
  import("@/components/common/invite-modal/invite-modal").then((mod) => ({
    default: mod.InviteModal,
  }))
);

interface PropertyDetailsPageProps {
  config: UserTypeConfig;
  userType: UserType;
  propertyId: string;
  initialProperty?: Property | null;
  initialPropertyAccess?: propertyAccess[] | null;
}

export function PropertyDetailsPage({
  config,
  userType,
  propertyId,
  initialProperty = null,
  initialPropertyAccess = null,
}: PropertyDetailsPageProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const user = useCurrentUser();
  const currentOrg = useCurrentOrg();
  const updatePropertyMetadata = useSelectedPropertyStore((s) => s.updatePropertyMetadata);

  const viewOnly = !can(CAPABILITIES.EDIT_PROPERTY);
  const canManageUsers = can(CAPABILITIES.MANAGE_USERS);

  const [isPending, startTransition] = useTransition();
  const [property, setProperty] = useState<Property | null>(initialProperty);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const initialFormRef = useRef({
    property_name: initialProperty?.name ?? "",
    property_address: initialProperty?.address ?? "",
    property_id: initialProperty?.address_place_id ?? "",
  });
  const [formValues, setFormValues] = useState<PropertySetupFormValues>(initialFormRef.current);

  const initialAccessRef = useRef<propertyAccess[]>(initialPropertyAccess ?? []);
  const [accessState, setAccessState] = useState<propertyAccess[]>(initialPropertyAccess ?? []);

  const currentProperty = property ?? initialProperty;

  const propertyAccessWithOwner = useMemo(
    () => addOwnerToAccessList(accessState, user, currentOrg),
    [accessState, user, currentOrg]
  );

  const hasFormChanges = useMemo(() => {
    const initial = initialFormRef.current;
    return (
      formValues.property_name !== initial.property_name ||
      formValues.property_address !== initial.property_address ||
      formValues.property_id !== initial.property_id
    );
  }, [formValues]);

  const hasAccessChanges = useMemo(() => {
    if (userType === "MULTI_TENANT") return false;
    return accessState.some((current) => {
      const initial = initialAccessRef.current.find(
        (i) => i.organization_user.user_id === current.organization_user.user_id
      );
      return initial && initial.access_type !== current.access_type;
    });
  }, [accessState, userType]);

  const hasUnsavedChanges = hasFormChanges || hasAccessChanges;

  const {
    showDialog: showUnsavedChangesDialog,
    handleOpenChange: handleUnsavedChangesOpenChange,
    handleLeave,
  } = useUnsavedChanges({ hasUnsavedChanges });

  const handleFormStateChange = useCallback((_isValid: boolean, values: PropertySetupFormValues) => {
    setFormValues(values);
  }, []);

  function handleRoleChange(userId: string, newRole: AccessType) {
    setAccessState((prev) =>
      prev.map((access) =>
        access.organization_user.user_id === userId
          ? { ...access, access_type: newRole }
          : access
      )
    );
  }

  function handleRemoveUser(userId: string) {
    setAccessState((prev) =>
      prev.filter((access) => access.organization_user.user_id !== userId)
    );
    initialAccessRef.current = initialAccessRef.current.filter(
      (access) => access.organization_user.user_id !== userId
    );
  }

  function handleSave() {
    if (!currentProperty) return;

    startTransition(async () => {
      const loadingToast = toast.loading("Saving changes", "Please wait...");

      try {
        const result = await updateProperty(currentProperty.id, {
          name: formValues.property_name,
          address_place_id: formValues.property_id,
        });

        if (!result.success) throw new Error(result.message);

        if (userType !== "MULTI_TENANT") {
          const changedAccess = accessState
            .map((current) => {
              const initial = initialAccessRef.current.find(
                (i) => i.organization_user.user_id === current.organization_user.user_id
              );
              if (initial && initial.access_type !== current.access_type) {
                return { access_id: initial.id, new_access_type: current.access_type };
              }
              return null;
            })
            .filter(Boolean) as { access_id: string; new_access_type: AccessType }[];

          const accessResults = await Promise.all(
            changedAccess.map((c) =>
              updatePropertyAccess(currentProperty.id, c.access_id, c.new_access_type)
            )
          );
          const failedResult = accessResults.find((r) => !r.success);
          if (failedResult) throw new Error(failedResult.message || "Failed to update property access");
        }

        const propertyResult = await getPropertyById(currentProperty.id);
        if (propertyResult.success && propertyResult.data) {
          setProperty(propertyResult.data);
          const newFormValues = {
            property_name: propertyResult.data.name,
            property_address: propertyResult.data.address,
            property_id: propertyResult.data.address_place_id,
          };
          setFormValues(newFormValues);
          initialFormRef.current = newFormValues;
          updatePropertyMetadata(currentProperty.id, {
            name: propertyResult.data.name,
            address: propertyResult.data.address,
          });
        }

        if (userType !== "MULTI_TENANT") {
          const accessResult = await getPropertyAccess(currentProperty.id);
          if (accessResult.success && accessResult.data) {
            setAccessState(accessResult.data);
            initialAccessRef.current = accessResult.data;
          }
        }

        toast.dismiss(loadingToast);
        toast.success("Changes saved", "Your changes have been saved successfully");
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Failed to save", error instanceof Error ? error.message : "Please try again");
      }
    });
  }

  async function handleDelete() {
    if (!currentProperty) return;
    const result = await deleteProperty(currentProperty.id);
    if (!result.success) throw new Error(result.message);
    router.push(ROUTES.DASHBOARD.ROOT);
    router.refresh();
  }

  async function handleInviteSubmit(data: any) {
    if (!currentProperty || !currentOrg) return;

    let unitId = getFirstUnitId(currentProperty);

    if (!unitId) {
      const unitResult = await createUnit(currentProperty.id, {
        name: "Default",
        organization_id: currentOrg.org_id,
      });
      if (!unitResult.success) {
        toast.error("Failed to create unit", unitResult.message || "Please try again");
        return;
      }
      unitId = unitResult.data.id;

      const refreshedProperty = await getPropertyById(currentProperty.id);
      if (refreshedProperty.success && refreshedProperty.data) {
        setProperty(refreshedProperty.data);
      }
    }

    const users = data.tenantInvites.map((invite: any) => ({
      email: invite.email,
      access_type: invite.permission === "edit" ? ACCESS_TYPES.EDITOR : ACCESS_TYPES.VIEWER,
      is_client: true,
    }));

    const result = await createPropertyAccess(currentProperty.id, unitId, users);
    if (!result.success) throw new Error(result.message);

    const accessResult = await getPropertyAccess(currentProperty.id);
    if (accessResult.success && accessResult.data) {
      setAccessState(accessResult.data);
      initialAccessRef.current = accessResult.data;
    }
  }

  const inviteModalConfig =
    config.inviteButtonText === "Invite Clients"
      ? INVITE_MODAL_CONFIGS.clients
      : INVITE_MODAL_CONFIGS.users;

  if (!currentProperty) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Property not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-8 px-3 sm:px-6 py-4 sm:py-5 h-full overflow-auto">
        <PropertyDetailsHeader
          propertyName={formValues.property_name}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isPending}
          onSave={handleSave}
          onDelete={handleDelete}
          config={config}
          viewOnly={viewOnly}
        />

        <div className="flex flex-col gap-3">
          <PropertyOverviewSection
            property={currentProperty}
            onFormStateChange={handleFormStateChange}
            viewOnly={viewOnly}
          />

          {userType !== "MULTI_TENANT" && (
            <UserManagementSection
              propertyAccess={propertyAccessWithOwner}
              propertyId={currentProperty.id}
              config={config}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveUser}
              onInvite={() => setIsInviteModalOpen(true)}
              viewOnly={!canManageUsers}
            />
          )}
        </div>
      </div>

      {userType !== "MULTI_TENANT" && isInviteModalOpen && (
        <Suspense fallback={null}>
          <LazyInviteModal
            open={isInviteModalOpen}
            onOpenChange={setIsInviteModalOpen}
            onSubmit={handleInviteSubmit}
            config={inviteModalConfig}
          />
        </Suspense>
      )}

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={handleUnsavedChangesOpenChange}
        onLeave={handleLeave}
      />
    </>
  );
}
