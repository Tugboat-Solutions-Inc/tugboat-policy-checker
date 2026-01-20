"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import EmptyState from "@/components/common/empty-state";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import { AddVideosForm } from "./add-videos-form";
import {
  addVideosSchema,
  createUploadSchema,
} from "../schemas/dashboard-schemas";
import type { UploadedVideo } from "@/components/common/upload-video/upload-video";
import {
  UploadImage,
  type UploadedFile,
} from "@/components/common/upload-image/upload-image";
import { toast } from "@/components/common/toast/toast";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import { Collection } from "@/features/collection-details/types/collection.types";
import {
  createUpload,
  updateUpload,
  getUploads,
} from "@/features/collection-details/api/upload.actions";
import { startDeduplication } from "@/features/collection-details/api/collection.actions";
import { getVideos } from "@/features/collection-details/api/video.actions";
import { Property } from "@/features/auth/types/property.types";
import { convertImageToBase64, getFirstUnitId } from "@/lib/utils";
import type { UploadStatus } from "@/features/collection-details/types/upload.types";
import type { Upload } from "@/features/auth/types/property.types";

interface DashboardLastUploadsSectionProps {
  collections: Collection[];
  property: Property;
}

function getCollectionNameForUpload(upload: Upload): string {
  return upload.collection_data?.name ?? "Unknown Collection";
}

export function DashboardLastUploadsSection({
  collections,
  property,
}: DashboardLastUploadsSectionProps) {
  const { can } = usePermissions();
  const viewOnly = !can(CAPABILITIES.EDIT_COLLECTIONS);
  const [isMultiStepModalOpen, setIsMultiStepModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [videos, setVideos] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [existingVideosCount, setExistingVideosCount] = useState(0);
  const MAX_VIDEOS_LIMIT = 10;
  const MAX_PHOTOS = 100;
  const lastUploads = property.last_uploads;

  const maxVideosAllowed = Math.max(0, MAX_VIDEOS_LIMIT - existingVideosCount);

  const handleCollectionChange = async (collection: Collection | null) => {
    setSelectedCollection(collection);
    setExistingVideosCount(0);

    if (collection) {
      const unitId = getFirstUnitId(property);
      if (unitId) {
        const result = await getVideos(property.id, unitId, collection.id);
        if (result.success && result.data) {
          setExistingVideosCount(result.data.length);
        }
      }
    }
  };

  const handleNotesChange = async (
    uploadId: string,
    value: string
  ): Promise<{ success: boolean }> => {
    const unitId = getFirstUnitId(property);
    if (!unitId) {
      toast.error("No unit found for this property");
      return { success: false };
    }
    let collectionId: string | null = null;

    for (const collection of collections) {
      const uploadsResult = await getUploads(
        collection.id,
        unitId,
        property.id
      );
      if (
        uploadsResult.success &&
        uploadsResult.data.data.some((upload) => upload.id === uploadId)
      ) {
        collectionId = collection.id;
        break;
      }
    }

    if (!collectionId) {
      toast.error("Could not find collection for this upload");
      return { success: false };
    }

    const result = await updateUpload(
      property.id,
      unitId,
      collectionId,
      uploadId,
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

  const handleVideosSelected = (files: File[]) => {
    const newUploadedFiles: UploadedVideo[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: "success" as const,
    }));
    setUploadedVideos((prev) => [...prev, ...newUploadedFiles]);
    setVideos((prev) => [...prev, ...files]);
  };

  const handleMultipleImagesSelected = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: "success" as const,
    }));
    setUploadedPhotos((prev) => [...prev, ...newFiles]);
    setPhotos((prev) => [...prev, ...files]);
  };

  const handleRemoveVideo = (fileId: string) => {
    const fileToRemove = uploadedVideos.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedVideos((prev) => prev.filter((f) => f.id !== fileId));
      setVideos((prev) => prev.filter((f) => f !== fileToRemove.file));
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  const handleRemoveImage = (fileId: string) => {
    const fileToRemove = uploadedPhotos.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedPhotos((prev) => prev.filter((f) => f.id !== fileId));
      setPhotos((prev) => prev.filter((f) => f !== fileToRemove.file));
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  const handleCrateUpload = async () => {
    try {
      if (!selectedCollection?.id) {
        toast.error("Please select a collection");
        return;
      }

      const unitId = getFirstUnitId(property);
      if (!unitId) {
        toast.error("No unit found for this property");
        return;
      }

      const validation = createUploadSchema.safeParse({
        collection_id: selectedCollection.id,
        unit_id: unitId,
        property_id: property.id,
        notes: notes,
        photos: photos,
      });

      if (!validation.success) {
        const errorMessage =
          validation.error.issues[0]?.message || "Validation failed";
        toast.error(errorMessage);
        return;
      }

      const photosBase64 = await Promise.all(
        photos.map(async (photo) => {
          const base64 = await convertImageToBase64(photo);
          if (!base64) {
            throw new Error(`Failed to convert photo to base64: ${photo.name}`);
          }
          return base64;
        })
      );

      const response = await createUpload(
        selectedCollection.id,
        unitId,
        property.id,
        {
          notes: notes || " ",
          photos_b64: photosBase64,
        }
      );

      if (!response.success) {
        toast.error(response.message || "Failed to create upload");
        return;
      }

      startDeduplication(property.id, unitId, selectedCollection.id);

      toast.success(`Photos uploaded to ${selectedCollection.name}! We're now detecting items. This may take a moment.`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create upload";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (!isMultiStepModalOpen) {
      setSelectedCollection(null);
      setNotes("");
      setVideos([]);
      setPhotos([]);
      setUploadedPhotos([]);
      setUploadedVideos([]);
      setExistingVideosCount(0);
    }
  }, [isMultiStepModalOpen]);

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="px-6">
      <div className=" mb-4 flex flex-row justify-between">
        <h2 className=" text-lg font-medium">Last Uploads</h2>
        <div className="gap-3 flex flex-row items-center">
          {property.id && (
            <Link
              href={ROUTES.DASHBOARD.ALL_UPLOADS(property.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 h-9 rounded-[8px]"
              )}
            >
              View All
            </Link>
          )}
          {can(CAPABILITIES.UPLOAD_MEDIA) && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsMultiStepModalOpen(true)}
              className="gap-2 h-9 rounded-[8px]"
            >
              <Plus className="h-4 w-4" />
              New Upload
            </Button>
          )}
          <TugboatMultiStepModal
            open={isMultiStepModalOpen}
            onOpenChange={setIsMultiStepModalOpen}
            maxWidth="lg"
            showCloseButton={true}
            steps={[
              {
                title: "Create New Upload",
                description: "Choose a collection to organize your uploads.",
                component: (
                  <AddVideosForm
                    collections={collections}
                    selectedCollection={selectedCollection}
                    notes={notes}
                    uploadedFiles={uploadedVideos}
                    onCollectionChange={handleCollectionChange}
                    onNotesChange={setNotes}
                    onFilesSelected={handleVideosSelected}
                    onRemoveFile={handleRemoveVideo}
                    maxVideos={maxVideosAllowed}
                  />
                ),
                isNextDisabled: !selectedCollection,
                maxFiles: maxVideosAllowed,
                currentFiles: uploadedVideos.length,
                onNext: async () => {
                  const validation = addVideosSchema.safeParse({
                    collection_id: selectedCollection?.id || "",
                    notes: notes,
                    walkthrough_videos: videos,
                  });

                  if (!validation.success) {
                    console.error(
                      "Validation errors:",
                      validation.error.issues
                    );
                    return false;
                  }
                  return true;
                },
              },
              {
                title: `Upload Photos to ${selectedCollection?.name}`,
                description:
                  "Upload photos of your items to add them to a collection.",
                component: (
                  <UploadImage
                    variant="multiple"
                    maxFiles={MAX_PHOTOS}
                    className=""
                    onFilesSelected={handleMultipleImagesSelected}
                    uploadedFiles={uploadedPhotos}
                    onRemoveFile={handleRemoveImage}
                  />
                ),
                maxFiles: MAX_PHOTOS,
                currentFiles: uploadedPhotos.length,
                showBackIcon: false,
              },
            ]}
            onComplete={async () => {
              await handleCrateUpload();
              setIsMultiStepModalOpen(false);
            }}
            onCancel={() => setIsMultiStepModalOpen(false)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-7">
        {lastUploads && lastUploads.length > 0 ? (
          lastUploads.map((upload) => (
            <CollectionListItem
              key={upload.id}
              image={upload.photo_urls[0]}
              title={getCollectionNameForUpload(upload)}
              photoCount={upload.photo_count ?? upload.photo_urls.length}
              itemCount={upload.items_count ?? 0}
              notes={upload.notes}
              onNotesEdit={(value) => handleNotesChange(upload.id, value)}
              completionPercentage={67}
              status={upload.upload_status as UploadStatus}
              date={upload.created_at}
              viewOnly={viewOnly}
            />
          ))
        ) : (
          <EmptyState
            title="No uploads yet"
            subtitle="Create your first upload to start documenting your items."
            className="h-auto py-12"
          />
        )}
      </div>
    </div>
  );
}
