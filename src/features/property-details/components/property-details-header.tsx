"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { toast } from "@/components/common/toast/toast";
import { UserTypeConfig } from "../types/property-details.types";
import { ROUTES } from "@/config/routes";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyDetailsHeaderProps {
  propertyName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDelete: () => Promise<void>;
  config: UserTypeConfig;
  viewOnly?: boolean;
  isLoadingViewOnly?: boolean;
}

export function PropertyDetailsHeader({
  propertyName,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onDelete,
  config,
  viewOnly,
  isLoadingViewOnly,
}: PropertyDetailsHeaderProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Deleting property", "Please wait...");

    try {
      await onDelete();

      toast.dismiss(loadingToast);
      toast.success(
        "Property deleted",
        `${propertyName} has been permanently deleted`
      );

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD.ROOT);
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete property", "Please try again");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">
        Property Details
      </h1>

      {isLoadingViewOnly ? (
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-9" />
        </div>
      ) : (
        !viewOnly && (
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
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={config.deleteDialogTitle}
        description={config.deleteDialogDescription}
        confirmText="Delete Property"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
