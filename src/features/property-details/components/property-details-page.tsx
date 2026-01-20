"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import { PropertyDetailsHeader } from "./property-details-header";
import { PropertyOverviewSection } from "./property-overview-section";
import { UserManagementSection } from "./user-management-section";
import { UnsavedChangesDialog } from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { toast } from "@/components/common/toast/toast";
import { UserTypeConfig, UserType } from "../types/property-details.types";
import type {
  propertyAccess,
  AccessType,
} from "../types/property-access.types";
import {
  getPropertyById,
  deleteProperty,
} from "@/features/auth/api/property.actions";
import type { Property } from "@/features/auth/types/property.types";
import { getFirstUnitId, hasUnits } from "@/lib/utils";
import type { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPropertyAccess,
  updatePropertyAccess,
  createPropertyAccess,
} from "../api/property-access.actions";
import { updateProperty } from "../api/property-details.actions";
import { ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/hooks/use-auth";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";

const LazyInviteModal = lazy(() =>
  import("@/components/common/invite-modal/invite-modal").then((mod) => ({
    default: mod.InviteModal,
  }))
);

const InviteModalFallback = () => null;

interface PropertyDetailsPageProps {
  config: UserTypeConfig;
  userType: UserType;
  propertyId: string;
  initialProperty?: Property | null;
  initialPropertyAccess?: propertyAccess[] | null;
}

const MemoizedPropertyOverviewSection = memo(PropertyOverviewSection);
const MemoizedUserManagementSection = memo(UserManagementSection);
const MemoizedPropertyDetailsHeader = memo(PropertyDetailsHeader);

export function PropertyDetailsPage({
  config,
  userType,
  propertyId,
  initialProperty = null,
  initialPropertyAccess = null,
}: PropertyDetailsPageProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const viewOnly = !can(CAPABILITIES.EDIT_PROPERTY);
  const updatePropertyMetadata = useSelectedPropertyStore((state) => state.updatePropertyMetadata);

  const [property, setProperty] = useState<Property | null>(initialProperty);
  const [isLoadingProperty, setIsLoadingProperty] = useState(!initialProperty);
  const [isLoadingPropertyAccess, setIsLoadingPropertyAccess] = useState(
    userType !== "MULTI_TENANT" && !initialPropertyAccess
  );
  const user = useCurrentUser();

  useEffect(() => {
    if (initialProperty) return;

    const fetchProperty = async () => {
      setIsLoadingProperty(true);
      try {
        const result = await getPropertyById(propertyId);
        if (result.success && result.data) {
          setProperty(result.data);
          const newValues = {
            property_name: result.data.name,
            property_address: result.data.address,
            property_id: result.data.address_place_id,
          };
          setFormValues(newValues);
          initialFormValuesRef.current = newValues;
        } else {
          toast.error("Failed to load property", "Property not found");
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
        toast.error("Failed to load property", "Please try again");
      } finally {
        setIsLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [propertyId, initialProperty]);

  useEffect(() => {
    if (initialPropertyAccess !== null || userType === "MULTI_TENANT") {
      if (initialPropertyAccess) {
        setPropertyAccessState(initialPropertyAccess);
        initialPropertyAccessRef.current = initialPropertyAccess;
      }
      setIsLoadingPropertyAccess(false);
      return;
    }

    if (!property) return;

    const fetchPropertyAccess = async () => {
      setIsLoadingPropertyAccess(true);
      try {
        const result = await getPropertyAccess(property.id);
        if (result.success && result.data) {
          setPropertyAccessState(result.data);
          initialPropertyAccessRef.current = result.data;
        }
      } catch (error) {
        console.error("Failed to fetch property access:", error);
        toast.error("Failed to load users", "Please try again");
      } finally {
        setIsLoadingPropertyAccess(false);
      }
    };

    fetchPropertyAccess();
  }, [property, userType, initialPropertyAccess]);

  const initialFormValues = useMemo(
    () => ({
      property_name: initialProperty?.name ?? property?.name ?? "",
      property_address: initialProperty?.address ?? property?.address ?? "",
      property_id:
        initialProperty?.address_place_id ?? property?.address_place_id ?? "",
    }),
    [initialProperty, property]
  );

  const [formValues, setFormValues] =
    useState<PropertySetupFormValues>(initialFormValues);
  const initialFormValuesRef =
    useRef<PropertySetupFormValues>(initialFormValues);
  const initialPropertyAccessRef = useRef<propertyAccess[]>(
    initialPropertyAccess ?? []
  );
  const [propertyAccessState, setPropertyAccessState] = useState<
    propertyAccess[]
  >(initialPropertyAccess ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (initialProperty) {
      const newValues = {
        property_name: initialProperty.name,
        property_address: initialProperty.address,
        property_id: initialProperty.address_place_id,
      };
      setFormValues(newValues);
      initialFormValuesRef.current = newValues;
    }
  }, [initialProperty]);

  const hasUnsavedChanges = useMemo(() => {
    if (!property && !initialProperty) return false;
    const initial = initialFormValuesRef.current;
    if (formValues.property_name !== initial.property_name) return true;
    if (formValues.property_address !== initial.property_address) return true;
    if (formValues.property_id !== initial.property_id) return true;

    if (userType !== "MULTI_TENANT") {
      const initialAccess = initialPropertyAccessRef.current;
      const currentAccess = propertyAccessState;

      const hasAccessChanges = currentAccess.some((current) => {
        const initialItem = initialAccess.find(
          (init) =>
            init.organization_user.user_id === current.organization_user.user_id
        );
        return initialItem && initialItem.access_type !== current.access_type;
      });

      if (hasAccessChanges) return true;
    }

    return false;
  }, [formValues, propertyAccessState, property, initialProperty, userType]);

  const {
    showDialog: showUnsavedChangesDialog,
    handleOpenChange: handleUnsavedChangesOpenChange,
    handleLeave,
  } = useUnsavedChanges({
    hasUnsavedChanges,
  });

  const handleFormStateChange = useCallback(
    (_isValid: boolean, values: PropertySetupFormValues) => {
      setFormValues(values);
    },
    []
  );

  const handleRoleChange = useCallback(
    (userId: string, newRole: AccessType) => {
      setPropertyAccessState((prev) =>
        prev.map((access) =>
          access.organization_user.user_id === userId
            ? { ...access, access_type: newRole }
            : access
        )
      );
    },
    []
  );

  const handleRemoveUser = useCallback((userId: string) => {
    setPropertyAccessState((prev) =>
      prev.filter((access) => access.organization_user.user_id !== userId)
    );
    initialPropertyAccessRef.current = initialPropertyAccessRef.current.filter(
      (access) => access.organization_user.user_id !== userId
    );
  }, []);

  const handleInvite = useCallback(() => {
    setIsInviteModalOpen(true);
  }, []);

  const handleInviteModalOpenChange = useCallback((open: boolean) => {
    setIsInviteModalOpen(open);
  }, []);

  const currentProperty = property ?? initialProperty;

  const handleInviteSubmit = useCallback(
    async (data: any) => {
      if (!currentProperty) {
        return;
      }

      const unitId = getFirstUnitId(currentProperty);
      if (!unitId) {
        toast.error(
          "No unit found",
          "This property needs a unit to invite users"
        );
        return;
      }
      const invites = data.tenantInvites;

      const users = invites.map((invite: any) => ({
        email: invite.email,
        access_type: invite.permission === "edit" ? "EDITOR" : "VIEWER",
        is_client: true,
      }));

      try {
        const result = await createPropertyAccess(
          currentProperty.id,
          unitId,
          users
        );
        if (!result.success) {
          throw new Error(result.message);
        }

        const accessResult = await getPropertyAccess(currentProperty.id);
        if (accessResult.success && accessResult.data) {
          setPropertyAccessState(accessResult.data);
          initialPropertyAccessRef.current = accessResult.data;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to send invites. Please try again.";
        throw new Error(errorMessage);
      }
    },
    [currentProperty]
  );

  const handleSave = useCallback(async () => {
    if (!currentProperty) return;

    const loadingToast = toast.loading("Saving changes", "Please wait...");
    setIsSaving(true);

    try {
      const result = await updateProperty(currentProperty.id, {
        name: formValues.property_name,
        address_place_id: formValues.property_id,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      if (userType !== "MULTI_TENANT") {
        const initialAccess = initialPropertyAccessRef.current;
        const currentAccess = propertyAccessState;

        const changedAccess = currentAccess
          .map((current) => {
            const initialItem = initialAccess.find(
              (init) =>
                init.organization_user.user_id ===
                current.organization_user.user_id
            );
            if (
              initialItem &&
              initialItem.access_type !== current.access_type
            ) {
              return {
                access_id: initialItem.id,
                user: current.organization_user.user,
                new_access_type: current.access_type,
              };
            }
            return null;
          })
          .filter(
            (
              item
            ): item is {
              access_id: string;
              user: any;
              new_access_type: AccessType;
            } => item !== null
          );

        const accessResults = await Promise.all(
          changedAccess.map((changed) =>
            updatePropertyAccess(
              currentProperty.id,
              changed.access_id,
              changed.new_access_type
            )
          )
        );

        const failedResult = accessResults.find((result) => !result.success);
        if (failedResult) {
          throw new Error(
            failedResult.message || "Failed to update property access"
          );
        }
      }

      const propertyResult = await getPropertyById(currentProperty.id);
      if (propertyResult.success && propertyResult.data) {
        setProperty(propertyResult.data);
        const updatedFormValues = {
          property_name: propertyResult.data.name,
          property_address: propertyResult.data.address,
          property_id: propertyResult.data.address_place_id,
        };
        setFormValues(updatedFormValues);
        initialFormValuesRef.current = updatedFormValues;
        
        updatePropertyMetadata(currentProperty.id, {
          name: propertyResult.data.name,
          address: propertyResult.data.address,
        });
      } else {
        initialFormValuesRef.current = { ...formValues };
      }

      if (userType !== "MULTI_TENANT") {
        const accessResult = await getPropertyAccess(currentProperty.id);
        if (accessResult.success && accessResult.data) {
          setPropertyAccessState(accessResult.data);
          initialPropertyAccessRef.current = accessResult.data;
        }
      }

      toast.dismiss(loadingToast);
      toast.success(
        "Changes saved",
        "Your changes have been saved successfully"
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to save",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setIsSaving(false);
    }
  }, [currentProperty, formValues, propertyAccessState, userType]);

  const handleDelete = useCallback(async () => {
    if (!currentProperty) return;

    const result = await deleteProperty(currentProperty.id);

    if (!result.success) {
      throw new Error(result.message);
    }

    router.push(ROUTES.DASHBOARD.ROOT);
    router.refresh();
  }, [currentProperty, router]);

  const inviteModalConfig = useMemo(() => {
    const INVITE_MODAL_CONFIGS = {
      clients: {
        title: "Invite Clients",
        description: "Send invitations to clients to join this property.",
        labelText: "Client emails",
        submitButtonText: "Send Invites",
        successNoun: "client",
      },
      users: {
        title: "Invite Users",
        description: "Send invitations to users to join this property.",
        labelText: "User emails",
        submitButtonText: "Send Invites",
        successNoun: "user",
      },
    };
    return config.inviteButtonText === "Invite Clients"
      ? INVITE_MODAL_CONFIGS.clients
      : INVITE_MODAL_CONFIGS.users;
  }, [config.inviteButtonText]);

  if (isLoadingProperty) {
    return (
      <div className="flex flex-col gap-4 sm:gap-8 px-3 sm:px-6 py-4 sm:py-5 h-full overflow-auto">
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

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
        <MemoizedPropertyDetailsHeader
          propertyName={formValues.property_name}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={handleSave}
          onDelete={handleDelete}
          config={config}
          viewOnly={viewOnly}
          isLoadingViewOnly={isLoadingPropertyAccess}
        />

        <div className="flex flex-col gap-3">
          <MemoizedPropertyOverviewSection
            property={currentProperty}
            onFormStateChange={handleFormStateChange}
            viewOnly={viewOnly}
          />
          {userType !== "MULTI_TENANT" && (
            <>
              {isLoadingPropertyAccess ? (
                <Skeleton className="h-[100px] w-full" />
              ) : (
                <MemoizedUserManagementSection
                  propertyAccess={propertyAccessState}
                  propertyId={currentProperty.id}
                  config={config}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveUser}
                  onInvite={handleInvite}
                  viewOnly={viewOnly}
                />
              )}
            </>
          )}
        </div>
      </div>

      {userType !== "MULTI_TENANT" && isInviteModalOpen && (
        <Suspense fallback={<InviteModalFallback />}>
          <LazyInviteModal
            open={isInviteModalOpen}
            onOpenChange={handleInviteModalOpenChange}
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
