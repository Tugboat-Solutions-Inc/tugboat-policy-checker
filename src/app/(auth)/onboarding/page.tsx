"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import IndividualNameForm from "@/features/auth/components/onboarding/individual-name-form";
import { OnboardingIntroSection } from "@/features/auth/components/onboarding/onboarding-intro-section";
import PropertySetupForm from "@/features/auth/components/onboarding/property-setup-form";
import { updateUser } from "@/features/auth/api/user.actions";
import { ROUTES } from "@/config/routes";
import type { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";
import { createClient } from "@/utils/supabase/client";
import { createProperty } from "@/features/auth/api/property.actions";
import { useCurrentOrg } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";

type NameFormData = {
  first_name: string;
  last_name: string;
};

export default function OnboardingIndividualPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"1" | "2">("1");
  const [nameData, setNameData] = useState<NameFormData | null>(null);
  const currentOrg = useCurrentOrg();
  const steps = ["1", "2"];
  const currentStep = steps.indexOf(activeTab) + 1;

  function preparePropertyData(values: PropertySetupFormValues, orgId: string) {
    return {
      name: values.property_name,
      address_place_id: values.property_id,
      organization_id: orgId,
    };
  }

  async function handleCompleteOnboarding(
    propertyData?: PropertySetupFormValues
  ) {
    try {
      if (nameData) {
        const result = await updateUser({
          first_name: nameData.first_name,
          last_name: nameData.last_name,
        });

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

        if (result.success) {
          const supabase = createClient();
          await supabase.auth.refreshSession();
          router.push(ROUTES.DASHBOARD.ROOT);
        } else {
          console.error("Failed to complete onboarding:", result.message);
        }
      } else {
        const supabase = createClient();
        await supabase.auth.refreshSession();
        router.push(ROUTES.DASHBOARD.ROOT);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  }

  function handleNameFormNext(data: NameFormData) {
    setNameData(data);
    setActiveTab("2");
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
        title={
          currentStep == 1 ? "Welcome to Tugboat" : "Create Your First Property"
        }
        description={
          currentStep == 1
            ? "Let's set up your profile."
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
          <IndividualNameForm onNext={handleNameFormNext} />
        </TabsContent>

        <TabsContent value="2">
          <PropertySetupForm
            userType="individual"
            onSubmit={handlePropertySubmit}
            onSkip={handlePropertySkip}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
