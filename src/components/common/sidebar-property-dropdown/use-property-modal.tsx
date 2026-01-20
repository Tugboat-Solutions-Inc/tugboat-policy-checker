import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AccountType } from "@/lib/auth";
import { usePropertyFormStore } from "@/stores/property-form-store";
import { useCurrentOrg } from "@/hooks/use-auth";
import { createProperty } from "@/features/auth/api/property.actions";
import { createUnit } from "@/features/dashboard/api/unit.actions";
import { createPropertyAccess } from "@/features/property-details/api/property-access.actions";
import { ROUTES } from "@/config/routes";
import { toast } from "../toast/toast";
import { MultiStepConfig } from "../tugboat-modal/tugboat-multi-step-modal";
import PropertySetupForm, {
  PropertySetupFormValues,
} from "@/features/auth/components/onboarding/property-setup-form";
import AddUnitsForm from "@/features/auth/components/onboarding/add-units-form";
import InviteClientsForm from "@/features/auth/components/onboarding/invite-clients-form";

interface UsePropertyModalReturn {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  isSubmitting: boolean;
  steps: MultiStepConfig[];
  handleComplete: () => Promise<void>;
  handleModalClose: () => void;
}

type ClientInvite = { email: string; permission: "view" | "edit" };

export function usePropertyModal(
  userType: AccountType
): UsePropertyModalReturn {
  const router = useRouter();
  const currentOrg = useCurrentOrg();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    propertySetup,
    units,
    clientInvites,
    setPropertySetup,
    setUnits,
    setClientInvites,
    reset,
  } = usePropertyFormStore();

  const isFormValid = !!(
    propertySetup?.property_name &&
    propertySetup?.property_address &&
    propertySetup?.property_id
  );
  const isUnitsFormValid = units.length > 0;
  const isMultiUnit = propertySetup?.multi_unit ?? false;
  const propertyName = propertySetup?.property_name ?? "";

  const handleFormStateChange = useCallback(
    (_isValid: boolean, values: PropertySetupFormValues) => {
      setPropertySetup(values);
    },
    [setPropertySetup]
  );

  const handleUnitsFormStateChange = useCallback(
    (_isValid: boolean, values: { units: { unit_name: string }[] }) => {
      setUnits(values.units);
    },
    [setUnits]
  );

  const handleClientsFormStateChange = useCallback(
    (_isValid: boolean, values: { clientInvites: ClientInvite[] }) => {
      setClientInvites(values.clientInvites);
    },
    [setClientInvites]
  );

  const handleComplete = useCallback(async () => {
    if (!currentOrg?.org_id || !propertySetup) return;

    setIsSubmitting(true);
    try {
      const result = await createProperty({
        name: propertySetup.property_name,
        address_place_id: propertySetup.property_id,
        organization_id: currentOrg.org_id,
      });

      if (result.success) {
        const propertyId = result.data.id;

        if (userType === "MULTI_TENANT" && units.length > 0) {
          await Promise.all(
            units.map((unit) =>
              createUnit(propertyId, {
                name: unit.unit_name,
                organization_id: currentOrg.org_id,
              })
            )
          );
        }

        if (userType === "COMPANY") {
          const unitResult = await createUnit(propertyId, {
            name: propertySetup.property_name,
            organization_id: currentOrg.org_id,
          });

          if (unitResult.success) {
            const unitId = unitResult.data.id;

            const validInvites = clientInvites.filter(
              (invite) => invite.email.trim() !== ""
            );

            if (validInvites.length > 0) {
              await createPropertyAccess(
                propertyId,
                unitId,
                validInvites.map((invite) => ({
                  email: invite.email,
                  access_type:
                    invite.permission === "edit" ? "EDITOR" : "VIEWER",
                  is_client: true,
                }))
              );
            }
          }
        }

        setIsModalOpen(false);
        reset();
        router.push(ROUTES.DASHBOARD.PROPERTY(propertyId));
        router.refresh();
        toast.success("New Property Created!");
      } else {
        console.error("Failed to create property:", result.message);
      }
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentOrg,
    propertySetup,
    reset,
    router,
    userType,
    units,
    clientInvites,
  ]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    reset();
  }, [reset]);

  const formUserType =
    userType === "MULTI_TENANT"
      ? "multi-tenant"
      : userType === "COMPANY"
        ? "company"
        : "individual";

  const steps = useMemo<MultiStepConfig[]>(() => {
    const hasSecondStep =
      (userType === "MULTI_TENANT" && isMultiUnit) || userType === "COMPANY";

    const propertySetupStep: MultiStepConfig = {
      title: "Add a New Property",
      description: "Enter property info to organize inventory.",
      component: (
        <PropertySetupForm
          userType={formUserType}
          onlyInputs={true}
          onFormStateChange={handleFormStateChange}
          initialValues={propertySetup || undefined}
        />
      ),
      onNext: () => isFormValid,
      nextText: hasSecondStep ? "Next Step" : "Create Property",
      showNextIcon: hasSecondStep,
      isNextDisabled: !isFormValid || isSubmitting,
    };

    if (userType === "MULTI_TENANT" && isMultiUnit) {
      const addUnitsStep: MultiStepConfig = {
        title: `Add Units to ${propertyName}`,
        description: "Add individual units to this multi-unit property.",
        component: (
          <AddUnitsForm
            onlyInputs={true}
            onFormStateChange={handleUnitsFormStateChange}
            initialValues={{ units }}
          />
        ),
        nextText: "Create Property",
        showNextIcon: false,
        isNextDisabled: !isUnitsFormValid || isSubmitting,
      };
      return [propertySetupStep, addUnitsStep];
    }

    if (userType === "COMPANY") {
      const inviteClientsStep: MultiStepConfig = {
        title: "Invite Clients (optional)",
        description:
          "Send email invites to give clients access to their property account.",
        component: (
          <InviteClientsForm
            onlyInputs={true}
            onFormStateChange={handleClientsFormStateChange}
            initialValues={{ clientInvites }}
          />
        ),
        nextText: "Create Property",
        showNextIcon: false,
        isNextDisabled: isSubmitting,
        showCancelInsteadOfBack: true,
      };
      return [propertySetupStep, inviteClientsStep];
    }

    return [propertySetupStep];
  }, [
    formUserType,
    userType,
    isMultiUnit,
    propertyName,
    isFormValid,
    isUnitsFormValid,
    isSubmitting,
    propertySetup,
    units,
    clientInvites,
    handleFormStateChange,
    handleUnitsFormStateChange,
    handleClientsFormStateChange,
  ]);

  return {
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    steps,
    handleComplete,
    handleModalClose,
  };
}
