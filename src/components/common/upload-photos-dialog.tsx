"use client";

import { useState, useCallback } from "react";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { Button } from "@/components/ui/button";
import { UploadImageDropzone } from "@/components/common/upload-image/upload-image-dropzone";
import { UploadImageMultiple } from "@/components/common/upload-image/upload-image-multiple";
import type { UploadedFile } from "@/components/common/upload-image/upload-image";
import { uploadPhotosInBatches } from "@/lib/client-upload";
import { toast } from "@/components/common/toast/toast";

interface UploadPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  unitId: string;
  collectionId: string;
  title?: string;
  description?: string;
  maxFiles?: number;
  onUploadComplete?: () => void;
}

export function UploadPhotosDialog({
  open,
  onOpenChange,
  propertyId,
  unitId,
  collectionId,
  title = "Create New Upload",
  description = "Upload photos of your items to add them to a collection.",
  maxFiles = 100,
  onUploadComplete,
}: UploadPhotosDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file,
      status: "success" as const,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [uploadedFiles]
  );

  const handleUpload = async () => {
    if (isUploading || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setProgress(null);
    try {
      const photos = uploadedFiles.map((f) => f.file).filter(Boolean) as File[];

      const result = await uploadPhotosInBatches(photos, {
        collectionId,
        unitId,
        propertyId,
        notes: " ",
        onProgress: ({ completed, total }) => {
          setProgress(`Uploading ${completed}/${total} photos...`);
        },
      });

      if (!result.success) {
        if (result.successCount > 0) {
          toast.warning(
            `${result.successCount}/${photos.length} photos uploaded`,
            "Some batches failed. Please try uploading the remaining photos again."
          );
        } else {
          toast.error("Failed to upload photos");
        }
        return;
      }

      toast.success("Photos uploaded! We're now detecting items from your photos. This may take a moment.");
      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
      setUploadedFiles([]);
      onUploadComplete?.();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload photos";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const handleCancel = () => {
    uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setUploadedFiles([]);
    onOpenChange(false);
  };

  return (
    <TugboatModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
          setUploadedFiles([]);
        }
        onOpenChange(isOpen);
      }}
      title={title}
      description={description}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm">
            {progress ? (
              <span className="text-muted-foreground">{progress}</span>
            ) : (
              <>
                <span className="font-medium text-foreground">Uploaded</span>
                <span className="text-muted-foreground">
                  {uploadedFiles.length}/{maxFiles}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="bg-accent-border hover:bg-accent-border/80"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
              loading={isUploading}
            >
              Upload Photos
            </Button>
          </div>
        </div>
      }
    >
      {uploadedFiles.length === 0 ? (
        <UploadImageDropzone
          onFilesSelected={handleFilesSelected}
          maxFiles={maxFiles}
        />
      ) : (
        <UploadImageMultiple
          uploadedFiles={uploadedFiles}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={handleRemoveFile}
          maxFiles={maxFiles}
        />
      )}
    </TugboatModal>
  );
}
