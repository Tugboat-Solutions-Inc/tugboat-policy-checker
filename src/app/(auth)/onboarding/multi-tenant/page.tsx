"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OnboardingIntroSection } from "@/features/auth/components/onboarding/onboarding-intro-section";
import PropertySetupForm from "@/features/auth/components/onboarding/property-setup-form";
import type { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";
import MultiTenantSetupForm from "@/features/auth/components/onboarding/multi-tenant-setup-form";
import AddUnitsForm from "@/features/auth/components/onboarding/add-units-form";
import { updateUser } from "@/features/auth/api/user.actions";
import { updateOrganization } from "@/features/dashboard/api/organization.actions";
import { createProperty } from "@/features/auth/api/property.actions";
import { createClient } from "@/utils/supabase/client";
import { useCurrentOrg, useCurrentUser } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";
import { ROUTES } from "@/config/routes";
import { convertImageToBase64 } from "@/lib/utils";

type MultiTenantSetupValues = {
  company_name: string;
  brand_icon?: File | null;
};

type AddUnitsFormValues = {
  units: { unit_name: string }[];
};

export default function OnboardingMultiTenantPage() {
  const [activeTab, setActiveTab] = useState<"1" | "2" | "3">("1");
  const [isMultiUnit, setIsMultiUnit] = useState(false);
  const [propertyName, setPropertyName] = useState<string>("");
  const [companyData, setCompanyData] = useState<MultiTenantSetupValues | null>(null);
  const [propertyData, setPropertyData] = useState<PropertySetupFormValues | null>(null);
  const currentOrg = useCurrentOrg();
  const currentUser = useCurrentUser();

  const steps = isMultiUnit ? ["1", "2", "3"] : ["1", "2"];
  const totalSteps = isMultiUnit ? 3 : 2;
  const currentStep = steps.indexOf(activeTab) + 1;

  function getDescription(currentStep: number) {
    if (currentStep == 1) {
      return "Customize how your organization appears to your team and tenants.";
    } else if (currentStep == 2) {
      return "Add basic details to get started. You can always edit or add more properties later.";
    } else if (currentStep == 3) {
      return "Add unit names or numbers to organize your property. You can edit or add more later.";
    }
  }

  function getTitle(currentStep: number) {
    if (currentStep == 1) {
      return "Company Setup";
    } else if (currentStep == 2) {
      return "Add Your First Property";
    } else if (currentStep == 3) {
      return `Add Units to ${propertyName}`;
    }
  }

  function preparePropertyData(values: PropertySetupFormValues, orgId: string) {
    return {
      name: values.property_name,
      address_place_id: values.property_id,
      organization_id: orgId,
    };
  }

  async function handleCompanySetupNext(data: MultiTenantSetupValues) {
    setCompanyData(data);
    
    const orgId = currentOrg?.org_id;
    if (orgId) {
      const updateData: { name?: string; logo_b64?: string } = {};
      
      if (data.company_name) {
        updateData.name = data.company_name;
      }
      
      if (data.brand_icon) {
        const base64 = await convertImageToBase64(data.brand_icon);
        if (base64) {
          updateData.logo_b64 = base64;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        const result = await updateOrganization(orgId, updateData);
        if (!result.success) {
          toast.error("Failed to update company", result.message || "Please try again");
          return;
        }
      }
    }
    
    setActiveTab("2");
  }

  async function handleCompleteOnboarding(propertyValues?: PropertySetupFormValues) {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No session found during onboarding completion");
        toast.error("Session expired", "Please log in again");
        window.location.href = ROUTES.AUTH.LOGIN;
        return;
      }

      const firstName = currentUser?.firstName || "User";
      const lastName = currentUser?.lastName || "";

      const result = await updateUser({
        first_name: firstName,
        last_name: lastName || "User",
        settings: {
          notifications: {
            sms: true,
            email: true,
            marketing: false,
          },
        },
      });

      if (!result.success) {
        console.error("Failed to complete onboarding:", result.message);
        toast.error("Failed to complete onboarding", result.message || "Please try again");
        return;
      }

      if (propertyValues) {
        const orgId = currentOrg?.org_id;
        if (!orgId) {
          toast.error(
            "Failed to create property",
            "Organization not found. Please try refreshing the page."
          );
        } else {
          const propertyResult = await createProperty(
            preparePropertyData(propertyValues, orgId)
          );
          if (!propertyResult.success) {
            toast.error("Failed to create property", propertyResult.message || "Please try again");
          }
        }
      }

      await supabase.auth.refreshSession().catch((err) => {
        console.warn("Session refresh failed, continuing anyway:", err);
      });
      
      window.location.href = ROUTES.DASHBOARD.ROOT;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Something went wrong", "Please try again");
      window.location.href = ROUTES.DASHBOARD.ROOT;
    }
  }

  async function handlePropertyNext(shouldGoToStep3: boolean) {
    if (shouldGoToStep3 && propertyData) {
      setActiveTab("3");
    } else if (propertyData) {
      await handleCompleteOnboarding(propertyData);
    }
  }

  async function handlePropertySubmit(values: PropertySetupFormValues) {
    setPropertyData(values);
    
    if (values.multi_unit) {
      setActiveTab("3");
    } else {
      await handleCompleteOnboarding(values);
    }
  }

  async function handlePropertySkip() {
    await handleCompleteOnboarding();
  }

  async function handleUnitsSubmit(data: AddUnitsFormValues) {
    await handleCompleteOnboarding(propertyData || undefined);
  }

  async function handleUnitsSkip() {
    await handleCompleteOnboarding(propertyData || undefined);
  }

  return (
    <div className="space-y-10">
      <OnboardingIntroSection
        title={getTitle(currentStep) ?? ""}
        description={getDescription(currentStep) ?? ""}
        totalSteps={totalSteps}
        currentStep={currentStep}
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "1" | "2" | "3")}
        className="space-y-8"
      >
        <TabsContent value="1">
          <MultiTenantSetupForm onNext={handleCompanySetupNext} />
        </TabsContent>

        <TabsContent value="2">
          <PropertySetupForm
            userType="multi-tenant"
            onMultiUnitChange={setIsMultiUnit}
            onPropertyNameChange={setPropertyName}
            onSubmit={handlePropertySubmit}
            onSkip={handlePropertySkip}
            onNext={handlePropertyNext}
          />
        </TabsContent>

        <TabsContent value="3">
          <AddUnitsForm
            onNext={handleUnitsSubmit}
            onSkip={handleUnitsSkip}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
