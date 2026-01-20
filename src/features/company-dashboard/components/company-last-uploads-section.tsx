"use client";

import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import EmptyState from "@/components/common/empty-state";
import type { Property, Upload } from "@/features/auth/types/property.types";
import type { UploadStatus } from "@/features/collection-details/types/upload.types";

interface CompanyLastUploadsSectionProps {
  properties: Property[];
}

type UploadWithProperty = Upload & {
  propertyName: string;
  propertyId: string;
};

function getLastUploadsFromProperties(
  properties: Property[]
): UploadWithProperty[] {
  const allUploads: UploadWithProperty[] = [];

  for (const property of properties) {
    if (property.last_uploads && property.last_uploads.length > 0) {
      for (const upload of property.last_uploads) {
        allUploads.push({
          ...upload,
          propertyName: property.name,
          propertyId: property.id,
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
