"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OnboardingIntroSection } from "@/features/auth/components/onboarding/onboarding-intro-section";
import CompanySetupForm from "@/features/auth/components/onboarding/company-setup-form";
import PropertySetupForm from "@/features/auth/components/onboarding/property-setup-form";
import type { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";
import { updateUser } from "@/features/auth/api/user.actions";
import { updateOrganization } from "@/features/dashboard/api/organization.actions";
import { createProperty } from "@/features/auth/api/property.actions";
import { createClient } from "@/utils/supabase/client";
import { useCurrentOrg, useCurrentUser } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";
import { ROUTES } from "@/config/routes";

type CompanySetupValues = {
  company_name: string;
};

export default function OnboardingCompanyPage() {
  const [activeTab, setActiveTab] = useState<"1" | "2">("1");
  const [companyData, setCompanyData] = useState<CompanySetupValues | null>(null);
  const currentOrg = useCurrentOrg();
  const currentUser = useCurrentUser();

  const steps = ["1", "2"];
  const currentStep = steps.indexOf(activeTab) + 1;

  function preparePropertyData(values: PropertySetupFormValues, orgId: string) {
    return {
      name: values.property_name,
      address_place_id: values.property_id,
      organization_id: orgId,
    };
  }

  async function handleCompanySetupNext(data: CompanySetupValues) {
    setCompanyData(data);
    
    const orgId = currentOrg?.org_id;
    if (orgId && data.company_name) {
      const result = await updateOrganization(orgId, { name: data.company_name });
      if (!result.success) {
        toast.error("Failed to update company name", result.message || "Please try again");
        return;
      }
    }
    
    setActiveTab("2");
  }

  async function handleCompleteOnboarding(propertyData?: PropertySetupFormValues) {
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

      if (propertyData) {
        const orgId = currentOrg?.org_id;
        if (!orgId) {
          toast.error(
            "Failed to create property",
            "Organization not found. Please try refreshing the page."
          );
        } else {
          const propertyResult = await createProperty(
            preparePropertyData(propertyData, orgId)
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

  async function handlePropertySubmit(values: PropertySetupFormValues) {
    await handleCompleteOnboarding(values);
  }

  async function handlePropertySkip() {
    await handleCompleteOnboarding();
  }

  return (
    <div className="space-y-10">
      <OnboardingIntroSection
        title={currentStep == 1 ? "Company Setup" : "Add Your First Property"}
        description={
          currentStep == 1
            ? "Set up your company profile to manage properties and collaborate with your team."
            : "Add basic details to get started. You can always edit or add more properties later."
        }
        totalSteps={2}
        currentStep={currentStep}
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "1" | "2")}
        className="space-y-8"
      >
        <TabsContent value="1">
          <CompanySetupForm onNext={handleCompanySetupNext} />
        </TabsContent>

        <TabsContent value="2">
          <PropertySetupForm
            userType="company"
            onSubmit={handlePropertySubmit}
            onSkip={handlePropertySkip}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
