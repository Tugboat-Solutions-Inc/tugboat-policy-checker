"use client";

import { useState, useEffect } from "react";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { UploadImage } from "@/components/common/upload-image/upload-image";
import { AlertCircle } from "lucide-react";
import { Collection } from "../types/collection.types";
import { env } from "@/lib/env";
import { convertImageToBase64 } from "@/lib/utils";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection;
  propertyId: string;
  unitId: string;
  onSave?: (data: {
    name: string;
    description?: string;
    cover_image_b64?: string;
    cover_removed?: boolean;
  }) => Promise<boolean>;
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
  propertyId,
  unitId,
  onSave,
}: EditCollectionDialogProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    collection.cover_image_url
      ? env.NEXT_PUBLIC_STORAGE_URL + collection.cover_image_url
      : null
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageRemoved, setCoverImageRemoved] = useState(false);
  const [hasFileSizeError, setHasFileSizeError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description || "");
      setCoverImageUrl(
        collection.cover_image_url
          ? env.NEXT_PUBLIC_STORAGE_URL + collection.cover_image_url
          : null
      );
      setCoverImageFile(null);
      setCoverImageRemoved(false);
    }
  }, [open, collection]);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setCoverImageFile(file);
      const url = URL.createObjectURL(file);
      setCoverImageUrl(url);
      setCoverImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setCoverImageUrl(null);
    setCoverImageFile(null);
    setCoverImageRemoved(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let cover_image_b64: string | undefined;
      let cover_removed: boolean = false;

      if (coverImageRemoved) {
        cover_removed = true;
      } else if (coverImageFile) {
        const base64Result = await convertImageToBase64(coverImageFile);
        if (base64Result) {
          cover_image_b64 = base64Result;
          cover_removed = false;
        }
      }

      const success = await onSave?.({
        name,
        description: description || undefined,
        cover_image_b64,
        cover_removed,
      });

      if (success) {
        setIsSaving(false);
        onOpenChange(false);
      } else {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error saving collection:", error);
      setIsSaving(false);
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <TugboatModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Collection Details"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="bg-accent-border hover:bg-accent-border/80"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isSaving} loading={isSaving}>
            Save changes
          </Button>
        </div>
      }
    >
      <div className="w-full">
        <Field className="gap-3 w-60">
          <FieldLabel className="font-medium text-sm flex items-center gap-2">
            Cover photo
            {hasFileSizeError && (
              <AlertCircle className="size-4 text-destructive" />
            )}
          </FieldLabel>
          <UploadImage
            variant="single"
            maxFiles={1}
            onRemove={handleRemoveImage}
            onFilesSelected={handleFileSelected}
            imageUrl={coverImageUrl}
            className="w-60 h-60"
            onFileSizeError={setHasFileSizeError}
          />
        </Field>

        <FieldGroup className="gap-4 mt-6">
          <Field className="gap-2">
            <div className="flex flex-row justify-between">
              <FieldLabel htmlFor="edit_collection_name" className="gap-1">
                Collection Name*
              </FieldLabel>
            </div>
            <Input
              id="edit_collection_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              className="w-full h-12 shadow-none"
              maxLength={80}
            />
          </Field>

          <Field className="gap-2">
            <div className="flex flex-row justify-between">
              <FieldLabel htmlFor="edit_description" className="gap-1">
                Description
              </FieldLabel>
              <FieldDescription>{description.length}/180</FieldDescription>
            </div>
            <Textarea
              id="edit_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full h-16 resize-none shadow-none focus:border-foreground"
              rows={2}
              maxLength={180}
            />
          </Field>
        </FieldGroup>
      </div>
    </TugboatModal>
  );
}
