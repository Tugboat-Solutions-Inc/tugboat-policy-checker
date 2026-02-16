"use client";

import { CollectionsDropdown } from "./collections-dropdown";
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
  onCollectionChange: (collection: Collection | null) => void;
  onNotesChange: (notes: string) => void;
  onCreateNewCollection?: () => void;
}

export function AddVideosForm({
  collections,
  selectedCollection,
  notes,
  onCollectionChange,
  onNotesChange,
  onCreateNewCollection,
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
            onCreateNew={onCreateNewCollection}
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
      </FieldGroup>
    </div>
  );
}
