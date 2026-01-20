"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DuplicatesAlert } from "@/components/common/alerts/duplicates-alert";
import { ResolveDuplicatesDialog } from "./resolve-duplicates-dialog";
import type { DuplicationGroup } from "../types/collection.types";

export const ITEMS_CHANGED_EVENT = "items-changed";

interface DuplicatesSectionProps {
  dupeGroups: DuplicationGroup[];
  propertyId: string;
  unitId: string;
  collectionId: string;
}

export function DuplicatesSection({
  dupeGroups,
  propertyId,
  unitId,
  collectionId,
}: DuplicatesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const validDupeGroups = useMemo(() => {
    return dupeGroups.filter((group) => group.items && group.items.length > 0);
  }, [dupeGroups]);

  const handleResolved = () => {
    window.dispatchEvent(new CustomEvent(ITEMS_CHANGED_EVENT));
    router.refresh();
  };

  if (validDupeGroups.length === 0) {
    return null;
  }

  return (
    <>
      <div className="px-2.5">
        <DuplicatesAlert
          title="We found possible duplicate items from your photos"
          description="Choose the collection with duplicates to review and clean up items."
          onResolveClick={() => setDialogOpen(true)}
        />
      </div>
      <ResolveDuplicatesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dupeGroups={validDupeGroups}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
        onResolved={handleResolved}
      />
    </>
  );
}
