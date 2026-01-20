"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CollectionItem } from "../types/collection-details.types";
import {
  UploadedFile,
  UploadImage,
} from "@/components/common/upload-image/upload-image";
import { useState, useEffect, useCallback } from "react";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { ViewPhotoDialog } from "./view-photo-dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  CONDITION_OPTIONS,
  CONDITION_STYLES,
} from "./items-table/editable-cells";
import type { ItemCondition } from "../types/collection-details.types";
import {
  getItemImages,
  deleteItemImage,
  addItemImage,
} from "../api/item.actions";
import type { ItemImage } from "../types/item.types";
import { env } from "@/lib/env";
import { convertImageToBase64 } from "@/lib/utils";

interface ItemDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CollectionItem | null;
  propertyId: string;
  unitId: string;
  collectionId: string;
  maxPhotos?: number;
}

export function ItemDetailsSheet({
  open,
  onOpenChange,
  item,
  propertyId,
  unitId,
  collectionId,
  maxPhotos = 100,
}: ItemDetailsSheetProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [serverImageIds, setServerImageIds] = useState<Set<string>>(new Set());
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    name?: string;
  } | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!item) return;

    setIsLoadingImages(true);
    const result = await getItemImages(
      item.id,
      propertyId,
      unitId,
      collectionId
    );
    if (result.success && result.data) {
      const serverFiles: UploadedFile[] = result.data.map((img: ItemImage) => ({
        id: img.id,
        url: `${env.NEXT_PUBLIC_STORAGE_URL}${img.url}`,
        file: null as unknown as File,
        status: "success" as const,
      }));
      setUploadedPhotos(serverFiles);
      setServerImageIds(new Set(result.data.map((img: ItemImage) => img.id)));
    }
    setIsLoadingImages(false);
  }, [item, propertyId, unitId, collectionId]);

  useEffect(() => {
    if (open && item) {
      fetchImages();
    } else if (!open) {
      setUploadedPhotos([]);
      setPhotos([]);
      setServerImageIds(new Set());
      setIsLoadingImages(false);
    }
  }, [open, item, fetchImages]);

  if (!item) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConditionDisplay = (condition: ItemCondition) => {
    return (
      CONDITION_OPTIONS.find((o) => o.value === condition)?.label || condition
    );
  };

  const detailFields = [
    { label: "Description", value: item.description },
    { label: "Category", value: item.category },
    { label: "Brand", value: item.brand },
    { label: "Model", value: item.model },
    { label: "Condition", value: item.condition, isCondition: true },
    { label: "Age", value: `${item.age} years` },
    { label: "Quantity", value: item.quantity.toString() },
    { label: "Item Value", value: formatCurrency(item.itemValue) },
  ];

  const handleRemoveImage = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteImage = () => {
    if (!fileToDelete || !item) return;

    const fileToRemove = uploadedPhotos.find((f) => f.id === fileToDelete);
    if (!fileToRemove) return;

    setUploadedPhotos((prev) => prev.filter((f) => f.id !== fileToDelete));

    if (serverImageIds.has(fileToDelete)) {
      setServerImageIds((prev) => {
        const next = new Set(prev);
        next.delete(fileToDelete);
        return next;
      });
      deleteItemImage(item.id, propertyId, unitId, collectionId, fileToDelete);
    } else {
      setPhotos((prev) => prev.filter((f) => f !== fileToRemove.file));
      URL.revokeObjectURL(fileToRemove.url);
    }

    setFileToDelete(null);
  };

  const handleMultipleImagesSelected = async (files: File[]) => {
    if (!item) return;

    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      status: "uploading" as const,
    }));

    setUploadedPhotos((prev) => [...prev, ...newFiles]);
    setPhotos((prev) => [...prev, ...files]);

    const uploadPromises = newFiles.map(async (uploadedFile) => {
      const base64 = await convertImageToBase64(uploadedFile.file);
      if (!base64) return { tempId: uploadedFile.id, success: false };

      const result = await addItemImage(
        item.id,
        propertyId,
        unitId,
        collectionId,
        {
          photo_b64: base64,
        }
      );

      return {
        tempId: uploadedFile.id,
        success: result.success,
        serverImage: result.success ? result.data : null,
      };
    });

    const results = await Promise.all(uploadPromises);

    setUploadedPhotos((prev) =>
      prev.map((file) => {
        const uploadResult = results.find((r) => r.tempId === file.id);
        if (!uploadResult) return file;

        if (uploadResult.success && uploadResult.serverImage) {
          return {
            ...file,
            id: uploadResult.serverImage.id,
            url: `${env.NEXT_PUBLIC_STORAGE_URL}${uploadResult.serverImage.url}`,
            status: "success" as const,
          };
        }
        return { ...file, status: "error" as const };
      })
    );

    setServerImageIds((prev) => {
      const next = new Set(prev);
      results.forEach((r) => {
        if (r.success && r.serverImage) {
          next.add(r.serverImage.id);
        }
      });
      return next;
    });
  };

  const handleImageClick = (file: UploadedFile) => {
    setSelectedPhoto({
      url: file.url,
      name: file.file?.name,
    });
    setIsPhotoDialogOpen(true);
  };

  const uploadingCount = uploadedPhotos.filter(
    (f) => f.status === "uploading"
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[454px] sm:max-w-[454px] p-0 gap-0 flex flex-col"
      >
        <SheetHeader
          className={cn(
            "p-4 border-b border-accent-border",
            isPhotoDialogOpen && "blur-sm"
          )}
        >
          <SheetTitle className="text-xl">{item.name}</SheetTitle>
        </SheetHeader>

        <div
          className={cn(
            "px-6 py-5 border-b border-border mb-4",
            isPhotoDialogOpen && "blur-sm"
          )}
        >
          <div className=" flex flex-col gap-4">
            {detailFields.map((field) => (
              <div key={field.label} className="flex items-start gap-12">
                <div className="text-sm text-muted-foreground w-[120px]">
                  {field.label}
                </div>

                {field.isCondition ? (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium border",
                      CONDITION_STYLES[field.value as ItemCondition]
                    )}
                  >
                    {getConditionDisplay(field.value as ItemCondition)}
                  </span>
                ) : (
                  <div className="text-sm text-foreground flex-1 truncate">
                    {field.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {uploadingCount > 0 && (
          <div
            className={cn(
              "flex items-center gap-2 px-5 pb-3",
              isPhotoDialogOpen && "blur-sm"
            )}
          >
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Uploading {uploadingCount}{" "}
              {uploadingCount === 1 ? "image" : "images"}...
            </span>
          </div>
        )}

        <div
          className={cn(
            "overflow-y-scroll pl-5 pr-1",
            isPhotoDialogOpen && "blur-sm"
          )}
        >
          {isLoadingImages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UploadImage
              variant="multiple"
              maxFiles={maxPhotos}
              onFilesSelected={handleMultipleImagesSelected}
              uploadedFiles={uploadedPhotos}
              onRemoveFile={handleRemoveImage}
              onImageClick={handleImageClick}
              isInsideSheet={true}
            />
          )}
        </div>
      </SheetContent>

      <ViewPhotoDialog
        open={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        photo={selectedPhoto}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Remove Image"
        description="Are you sure you want to remove this image? This action cannot be undone."
        cancelText="Cancel"
        confirmText="Remove"
        onConfirm={confirmDeleteImage}
      />
    </Sheet>
  );
}
