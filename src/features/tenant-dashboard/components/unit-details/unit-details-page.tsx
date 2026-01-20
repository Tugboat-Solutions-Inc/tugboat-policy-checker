"use client";

import { useState, useCallback, useMemo } from "react";
import { UnitDetails } from "../../api/tenant-dashboard.actions";
import { updateUnit } from "@/features/dashboard/api/unit.actions";
import { UnitDetailsHeader } from "./unit-details-header";
import { UnitOverviewSection } from "./unit-overview-section";
import { TenantManagementSection } from "./tenant-management-section";
import { UnsavedChangesDialog } from "@/components/common/unsaved-changes-dialog";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { toast } from "@/components/common/toast/toast";

interface UnitDetailsPageProps {
  propertyId: string;
  unit: UnitDetails;
}

export function UnitDetailsPage({ propertyId, unit }: UnitDetailsPageProps) {
  const [unitName, setUnitName] = useState(unit.name);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    return unitName !== unit.name;
  }, [unitName, unit.name]);

  const {
    showDialog: showUnsavedChangesDialog,
    handleOpenChange: handleUnsavedChangesOpenChange,
    handleLeave,
  } = useUnsavedChanges({
    hasUnsavedChanges,
  });

  const handleUnitNameChange = useCallback((newName: string) => {
    setUnitName(newName);
  }, []);

  const handleSave = async () => {
    if (!propertyId || !unit.id) {
      toast.error("Failed to save", "Missing property or unit information");
      return;
    }

    const loadingToast = toast.loading("Saving changes", "Please wait...");
    setIsSaving(true);

    try {
      const result = await updateUnit(propertyId, unit.id, { name: unitName });

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(
          "Changes saved",
          "Your changes have been saved successfully"
        );
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to save", result.message || "Please try again");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save", "Please try again");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-8 px-3 sm:px-6 py-4 sm:py-5 h-full overflow-auto">
        <UnitDetailsHeader
          propertyId={propertyId}
          unitId={unit.id}
          unitName={unitName}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onSave={handleSave}
        />

        <div className="flex flex-col gap-3">
          <UnitOverviewSection
            unitName={unitName}
            onChange={handleUnitNameChange}
          />
          <TenantManagementSection
            tenants={unit.tenants}
            unitId={unit.id}
            propertyId={propertyId}
          />
        </div>
      </div>

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={handleUnsavedChangesOpenChange}
        onLeave={handleLeave}
      />
    </>
  );
}
