"use client";

import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import EmptyState from "@/components/common/empty-state";
import type { Property, Upload } from "@/features/auth/types/property.types";
import type { UploadStatus } from "@/features/collection-details/types/upload.types";
import { retryUpload } from "@/features/collection-details/api/upload.actions";
import { toast } from "@/components/common/toast/toast";
import { getFirstUnitId } from "@/lib/utils";

interface CompanyLastUploadsSectionProps {
  properties: Property[];
}

type UploadWithProperty = Upload & {
  propertyName: string;
  propertyId: string;
  unitId: string | null;
};

function getLastUploadsFromProperties(
  properties: Property[]
): UploadWithProperty[] {
  const allUploads: UploadWithProperty[] = [];

  for (const property of properties) {
    if (property.last_uploads && property.last_uploads.length > 0) {
      const unitId = getFirstUnitId(property);
      for (const upload of property.last_uploads) {
        allUploads.push({
          ...upload,
          propertyName: property.name,
          propertyId: property.id,
          unitId,
        });
      }
    }
  }

  allUploads.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return allUploads.slice(0, 10);
}

export function CompanyLastUploadsSection({
  properties,
}: CompanyLastUploadsSectionProps) {
  const lastUploads = getLastUploadsFromProperties(properties);

  const hasAnyCollections = properties.some(
    (property) => property.last_uploads && property.last_uploads.length > 0
  );

  const handleRetryUpload = async (upload: UploadWithProperty) => {
    if (!upload.unitId) {
      toast.error("No unit found for this property");
      return;
    }

    const collectionId = upload.collection_data?.id;
    if (!collectionId) {
      toast.error("Could not find collection for this upload");
      return;
    }

    const loadingToast = toast.loading("Retrying upload", "Please wait...");

    const result = await retryUpload(
      upload.propertyId,
      upload.unitId,
      collectionId,
      upload.id
    );

    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success("Upload retry started", "Processing will begin shortly.");
    } else {
      toast.error("Failed to retry upload", result.message || "Please try again.");
    }
  };

  if (!hasAnyCollections) {
    return null;
  }

  return (
    <div className="px-6 pb-6">
      <div className="mb-4 flex flex-row justify-between">
        <h2 className="text-lg font-medium">Last Uploads</h2>
      </div>
      <div className="flex flex-col gap-2">
        {lastUploads.length > 0 ? (
          lastUploads.map((upload) => (
            <CollectionListItem
              key={upload.id}
              image={upload.photo_urls[0]}
              title={upload.propertyName}
              photoCount={upload.photo_count ?? upload.photo_urls.length}
              itemCount={upload.items_count ?? 0}
              notes={upload.notes}
              onRetry={upload.upload_status === "FAILED" ? () => handleRetryUpload(upload) : undefined}
              completionPercentage={67}
              status={upload.upload_status as UploadStatus}
              date={upload.created_at}
              viewOnly={true}
            />
          ))
        ) : (
          <EmptyState
            title="No uploads yet"
            subtitle="Upload photos to your properties to see them here."
            className="h-auto py-12"
          />
        )}
      </div>
    </div>
  );
}
