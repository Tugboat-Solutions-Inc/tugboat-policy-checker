"use client";

import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { updateUpload, retryUpload } from "@/features/collection-details/api/upload.actions";
import { toast } from "@/components/common/toast/toast";
import EmptyState from "@/components/common/empty-state";
import type { UploadStatus } from "@/features/collection-details/types/upload.types";
import type { UploadWithContext } from "@/app/dashboard/@individual/property/[propertyId]/uploads/page";

interface UploadsListContentProps {
  propertyId: string;
  uploads: UploadWithContext[];
}

export function UploadsListContent({
  propertyId,
  uploads,
}: UploadsListContentProps) {
  const { can } = usePermissions();
  const viewOnly = !can(CAPABILITIES.EDIT_COLLECTIONS);

  const handleNotesChange = async (
    upload: UploadWithContext,
    value: string
  ): Promise<{ success: boolean }> => {
    const result = await updateUpload(
      propertyId,
      upload.unitId,
      upload.collectionId,
      upload.id,
      { notes: value }
    );

    if (result.success) {
      toast.success("Notes updated");
      return { success: true };
    } else {
      toast.error(result.message || "Failed to update notes");
      return { success: false };
    }
  };

  const handleRetryUpload = async (upload: UploadWithContext): Promise<void> => {
    if (!upload.collectionId) {
      toast.error("Could not find collection for this upload");
      return;
    }

    const loadingToast = toast.loading("Retrying upload", "Please wait...");

    const result = await retryUpload(
      propertyId,
      upload.unitId,
      upload.collectionId,
      upload.id
    );

    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success("Upload retry started", "Processing will begin shortly.");
    } else {
      toast.error("Failed to retry upload", result.message || "Please try again.");
    }
  };

  if (uploads.length === 0) {
    return (
      <div className="mx-6 mt-2 mb-7 flex-1 min-h-0 flex flex-col items-center justify-center">
        <EmptyState
          title="No uploads yet"
          subtitle="Upload photos to your collections to see them here."
          className="h-auto py-12"
        />
      </div>
    );
  }

  return (
    <div className="mx-6 mt-2 mb-7 flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto thin-scrollbar">
      {uploads.map((upload) => (
        <CollectionListItem
          key={upload.id}
          image={upload.photo_urls[0]}
          title={upload.collectionName}
          photoCount={upload.photo_urls.length}
          itemCount={upload.items_count}
          notes={upload.notes}
          onNotesEdit={(value) => handleNotesChange(upload, value)}
          onRetry={upload.upload_status === "FAILED" ? () => handleRetryUpload(upload) : undefined}
          status={upload.upload_status as UploadStatus}
          date={upload.created_at}
          viewOnly={viewOnly}
        />
      ))}
    </div>
  );
}
