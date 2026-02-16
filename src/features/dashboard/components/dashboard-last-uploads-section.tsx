"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import EmptyState from "@/components/common/empty-state";
import { NavLink } from "@/components/common/nav-link";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { AddVideosForm } from "./add-videos-form";
import { AddCollectionForm } from "./add-collection-form";
import { addCollectionSchema } from "../schemas/dashboard-schemas";
import {
  createUploadSchema,
} from "../schemas/dashboard-schemas";
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
  retryUpload,
} from "@/features/collection-details/api/upload.actions";
import { createCollection } from "@/features/collection-details/api/collection.actions";
import { startDeduplication } from "@/features/collection-details/api/collection.actions";
import { Property } from "@/features/auth/types/property.types";
import { convertImageToBase64, getFirstUnitId } from "@/lib/utils";
import { compressImage } from "@/lib/client-upload";
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
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const MAX_PHOTOS = 100;
  const lastUploads = property.last_uploads;

  const [collectionName, setCollectionName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isTransitioningToCreate = useRef(false);

  const handleCollectionChange = async (collection: Collection | null) => {
    setSelectedCollection(collection);
  };

  const handleRetryUpload = async (upload: Upload) => {
    const unitId = getFirstUnitId(property);
    if (!unitId) {
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
      property.id,
      unitId,
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

  const handleRemoveImage = (fileId: string) => {
    const fileToRemove = uploadedPhotos.find((f) => f.id === fileId);
    if (fileToRemove) {
      setUploadedPhotos((prev) => prev.filter((f) => f.id !== fileId));
      setPhotos((prev) => prev.filter((f) => f !== fileToRemove.file));
      URL.revokeObjectURL(fileToRemove.url);
    }
  };

  const handleCrateUpload = async (): Promise<boolean> => {
    try {
      if (!selectedCollection?.id) {
        toast.error("Please select a collection");
        return false;
      }

      const unitId = getFirstUnitId(property);
      if (!unitId) {
        toast.error("No unit found for this property");
        return false;
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
        return false;
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

      const loadingToast = toast.loading(
        "Uploading photos",
        `Uploading ${photos.length} ${photos.length === 1 ? "photo" : "photos"} to ${selectedCollection.name}...`
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

      toast.dismiss(loadingToast);

      if (!response.success) {
        toast.error("Failed to create upload", response.message || `Could not upload photos to ${selectedCollection.name}`);
        return false;
      }

      startDeduplication(property.id, unitId, selectedCollection.id);

      toast.success(`Photos uploaded to ${selectedCollection.name}!`, `We're now detecting items. This may take a moment.`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create upload";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleCreateNewCollection = async () => {
    const validation = addCollectionSchema.safeParse({
      name: collectionName,
      description: description,
      cover_image: coverImage,
    });

    if (!validation.success) {
      return;
    }

    setIsCreating(true);

    try {
      const unitId = getFirstUnitId(property);
      if (!unitId) {
        toast.error("Unable to create collection", "This property doesn't have a unit set up yet.");
        return;
      }

      let cover_image_b64: string | null = null;
      if (coverImageFile) {
        const compressedCover = await compressImage(coverImageFile);
        cover_image_b64 = await convertImageToBase64(compressedCover);
      }

      const result = await createCollection(
        property.id,
        unitId,
        {
          name: collectionName,
          description: description || "",
          cover_image_b64: cover_image_b64 || undefined,
        },
      
      );

      if (!result.success) {
        toast.error("Failed to create collection", result.message || "Something went wrong.");
        return;
      }

      toast.success(`Collection "${collectionName}" created!`);
      setIsCreateCollectionOpen(false);
      setSelectedCollection(result.data);
      setIsMultiStepModalOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCoverImageSelected = (files: File[]) => {
    if (files.length > 0) {
      const previewUrl = URL.createObjectURL(files[0]);
      setCoverImage(previewUrl);
      setCoverImageFile(files[0]);
    }
  };

  const handleRemoveCoverImage = () => {
    if (coverImage) {
      URL.revokeObjectURL(coverImage);
      setCoverImage(null);
    }
    setCoverImageFile(null);
  };

  useEffect(() => {
    if (!isMultiStepModalOpen) {
      if (isTransitioningToCreate.current) {
        isTransitioningToCreate.current = false;
      } else {
        setSelectedCollection(null);
      }
      setNotes("");
      setPhotos([]);
      setUploadedPhotos([]);
    }
  }, [isMultiStepModalOpen]);

  useEffect(() => {
    if (!isCreateCollectionOpen) {
      setCollectionName("");
      setDescription("");
      setCoverImage(null);
      setCoverImageFile(null);
    }
  }, [isCreateCollectionOpen]);

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="px-6">
      <div className=" mb-4 flex flex-row justify-between">
        <h2 className=" text-lg font-medium">Last Uploads</h2>
        <div className="gap-3 flex flex-row items-center">
          {property.id && (
            <NavLink
              href={ROUTES.DASHBOARD.ALL_UPLOADS(property.id)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 h-9 rounded-[8px]"
              )}
            >
              View All
            </NavLink>
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
                    onCollectionChange={handleCollectionChange}
                    onNotesChange={setNotes}
                    onCreateNewCollection={() => {
                      isTransitioningToCreate.current = true;
                      setIsMultiStepModalOpen(false);
                      setIsCreateCollectionOpen(true);
                    }}
                  />
                ),
                isNextDisabled: !selectedCollection,
                onNext: async () => {
                  return !!selectedCollection;
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
              const success = await handleCrateUpload();
              if (success) {
                setIsMultiStepModalOpen(false);
              }
              return success;
            }}
            onCancel={() => setIsMultiStepModalOpen(false)}
          />
          <TugboatModal
            open={isCreateCollectionOpen}
            onOpenChange={setIsCreateCollectionOpen}
            title="Add a New Collection"
            description="Add a name, cover, and photos. We'll generate a cover if you skip it."
            maxWidth="lg"
            showCloseButton={true}
            footer={
              <div className="flex gap-3 justify-end w-full">
                <Button
                  variant="secondary"
                  onClick={() => setIsCreateCollectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNewCollection}
                  disabled={!collectionName.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Create new"}
                  {!isCreating && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            }
          >
            <AddCollectionForm
              onFileSelected={handleCoverImageSelected}
              onRemove={handleRemoveCoverImage}
              uploadedImage={coverImage}
              description={description}
              onDescriptionChange={setDescription}
              collectionName={collectionName}
              onCollectionNameChange={setCollectionName}
            />
          </TugboatModal>
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
              onRetry={upload.upload_status === "FAILED" ? () => handleRetryUpload(upload) : undefined}
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
