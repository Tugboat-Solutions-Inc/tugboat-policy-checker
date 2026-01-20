"use client";

import { CollectionsDropdown } from "./collections-dropdown";
import {
  UploadVideo,
  type UploadedVideo,
} from "@/components/common/upload-video/upload-video";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Collection } from "@/features/collection-details/types/collection.types";

interface AddVideosFormProps {
  collections: Collection[];
  selectedCollection: Collection | null;
  notes: string;
  uploadedFiles: UploadedVideo[];
  onCollectionChange: (collection: Collection | null) => void;
  onNotesChange: (notes: string) => void;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
  maxVideos?: number;
}

export function AddVideosForm({
  collections,
  selectedCollection,
  notes,
  uploadedFiles,
  onCollectionChange,
  onNotesChange,
  onFilesSelected,
  onRemoveFile,
  maxVideos = 10,
}: AddVideosFormProps) {
  return (
    <div className="w-full">
      <FieldGroup className="gap-4">
        <Field className="gap-2">
          <FieldLabel htmlFor="collection_id" className="gap-1">
            Choose a collection*
          </FieldLabel>
          <CollectionsDropdown
            collections={collections}
            value={selectedCollection}
            onChange={onCollectionChange}
          />
        </Field>

        <Field className="gap-2">
          <div className="flex flex-row justify-between">
            <FieldLabel htmlFor="notes" className="gap-1">
              Notes
            </FieldLabel>
            <FieldDescription>{notes?.length || "0"}/80</FieldDescription>
          </div>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter notes"
            className="w-full h-12"
            maxLength={80}
          />
        </Field>

        <Field className="gap-2">
          {uploadedFiles.length === 0 && (
            <FieldLabel htmlFor="walkthrough_videos" className="py-2">
              Walkthrough video
            </FieldLabel>
          )}
          <UploadVideo
            variant="multiple"
            className="mt-2"
            maxFiles={maxVideos}
            uploadedFiles={uploadedFiles}
            onFilesSelected={onFilesSelected}
            onRemoveFile={onRemoveFile}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
