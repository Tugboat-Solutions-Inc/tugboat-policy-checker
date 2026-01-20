// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OnboardingIntroSection } from "@/features/auth/components/onboarding/onboarding-intro-section";
import CompanySetupForm from "@/features/auth/components/onboarding/company-setup-form";
import PropertySetupForm from "@/features/auth/components/onboarding/property-setup-form";

export default function OnboardingIndividualPage() {
  const [activeTab, setActiveTab] = useState<"1" | "2">("1");

  const steps = ["1", "2"];
  const currentStep = steps.indexOf(activeTab) + 1;


  
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
          <CompanySetupForm onNext={() => setActiveTab("2")} />
        </TabsContent>

        <TabsContent value="2">
          <PropertySetupForm userType="company" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
