// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OnboardingIntroSection } from "@/features/auth/components/onboarding/onboarding-intro-section";
import PropertySetupForm from "@/features/auth/components/onboarding/property-setup-form";
import MultiTenantSetupForm from "@/features/auth/components/onboarding/multi-tenant-setup-form";
import AddUnitsForm from "@/features/auth/components/onboarding/add-units-form";

export default function OnboardingIndividualPage() {
  const [activeTab, setActiveTab] = useState<"1" | "2" | "3">("1");
  const [isMultiUnit, setIsMultiUnit] = useState(false);
  const [propertyName, setPropertyName] = useState<string>("");

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
          <MultiTenantSetupForm onNext={() => setActiveTab("2")} />
        </TabsContent>

        <TabsContent value="2">
          <PropertySetupForm
            userType="multi-tenant"
            onMultiUnitChange={setIsMultiUnit}
            onPropertyNameChange={setPropertyName}
            onNext={(shouldGoToStep3) => {
              if (shouldGoToStep3) {
                setActiveTab("3");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="3">
          <AddUnitsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
