"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash } from "lucide-react";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { toast } from "@/components/common/toast/toast";
import { deleteUnit } from "@/features/dashboard/api/unit.actions";
import { ROUTES } from "@/config/routes";

interface UnitDetailsHeaderProps {
  propertyId: string;
  unitId: string;
  unitName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function UnitDetailsHeader({
  propertyId,
  unitId,
  unitName,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: UnitDetailsHeaderProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyId || !unitId) {
      toast.error("Failed to delete", "Missing property or unit information");
      return;
    }

    const loadingToast = toast.loading("Deleting unit", "Please wait...");

    try {
      const result = await deleteUnit(propertyId, unitId);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(
          "Unit deleted",
          `${unitName} has been permanently deleted`
        );
        router.push(ROUTES.DASHBOARD.PROPERTY(propertyId));
      } else {
        toast.error(
          "Failed to delete unit",
          result.message || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete unit", "Please try again");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center size-6 bg-background border border-border rounded-md hover:bg-accent transition-colors shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
          {unitName} Details
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
        <Button
          variant="default"
          size="default"
          disabled={!hasUnsavedChanges || isSaving}
          onClick={onSave}
          className={
            !hasUnsavedChanges
              ? "bg-[rgba(34,158,186,0.05)] text-[rgba(13,123,148,0.3)] hover:bg-[rgba(34,158,186,0.05)]"
              : ""
          }
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={handleDelete}
          className="size-9 p-0 hover:text-destructive"
        >
          <Trash className="h-4 w-4 " />
        </Button>
      </div>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Unit?"
        description="This will permanently delete the unit and any users it is shared with will no longer be able to access it."
        confirmText="Delete Unit"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
