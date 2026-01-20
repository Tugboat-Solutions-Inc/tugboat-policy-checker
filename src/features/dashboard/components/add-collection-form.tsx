import { UploadImage } from "@/components/common/upload-image/upload-image";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import * as React from "react";

interface AddCollectionFormProps {
  onRemove?: () => void;
  onFileSelected: (files: File[]) => void;
  uploadedImage?: string | null;
  description: string;
  collectionName: string;
  onDescriptionChange: (description: string) => void;
  onCollectionNameChange: (name: string) => void;
}

export function AddCollectionForm({
  onRemove,
  onFileSelected,
  uploadedImage,
  description,
  onDescriptionChange,
  collectionName,
  onCollectionNameChange,
}: AddCollectionFormProps) {
  const [hasFileSizeError, setHasFileSizeError] = React.useState(false);

  return (
    <div className="w-full">
      <Field className="gap-3 w-60">
        <FieldLabel className="font-medium text-sm flex items-center gap-2">
          Add Cover Photo
          {hasFileSizeError && (
            <AlertCircle className="size-4 text-destructive" />
          )}
        </FieldLabel>
        <UploadImage
          variant="single"
          maxFiles={1}
          onRemove={onRemove}
          onFilesSelected={onFileSelected}
          imageUrl={uploadedImage}
          className="w-60 h-60 "
          onFileSizeError={setHasFileSizeError}
        />
      </Field>

      <FieldGroup className="gap-4 mt-6">
        <Field className="gap-2">
          <div className="flex flex-row justify-between">
            <FieldLabel htmlFor="collection_name" className="gap-1">
              Collection Name*
            </FieldLabel>
          </div>
          <Input
            id="collection_name"
            value={collectionName}
            onChange={(e) => onCollectionNameChange(e.target.value)}
            placeholder="Enter collection name"
            className="w-full h-12 shadow-none"
            maxLength={80}
          />
        </Field>
        <Field className="gap-2">
          <div className="flex flex-row justify-between">
            <FieldLabel htmlFor="description" className="gap-1">
              Description
            </FieldLabel>
            <FieldDescription>
              {description?.length || "0"}/180
            </FieldDescription>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter description"
            className="w-full h-16 resize-none shadow-none focus:border-foreground "
            rows={2}
            maxLength={180}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
