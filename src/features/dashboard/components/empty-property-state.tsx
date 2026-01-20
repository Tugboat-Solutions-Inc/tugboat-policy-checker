"use client";

import EmptyState from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import { usePropertyModal } from "@/components/common/sidebar-property-dropdown/use-property-modal";
import { useOrgType } from "@/hooks/use-auth";
import type { AccountType } from "@/lib/auth";

export function EmptyPropertyState() {
  const orgType = useOrgType() as AccountType | null;
  const userType = orgType || "INDIVIDUAL";

  const {
    isModalOpen,
    setIsModalOpen,
    steps,
    handleComplete,
    handleModalClose,
  } = usePropertyModal(userType);

  return (
      <EmptyState
        title="No properties yet"
        subtitle="Create your first property to get started."
      >
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4 text-white" />
          Add New Property
        </Button>
      <TugboatMultiStepModal
          open={isModalOpen}
        onOpenChange={(open) => !open && handleModalClose()}
          maxWidth="lg"
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleModalClose}
        showStepIndicator={steps.length > 1}
            />
      </EmptyState>
  );
}
