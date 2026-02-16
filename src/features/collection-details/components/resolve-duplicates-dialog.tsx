"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DuplicationGroup } from "../types/collection.types";
import type { Item } from "../types/item.types";
import { resolveDuplicationGroup } from "../api/collection.actions";
import { toast } from "@/components/common/toast/toast";
import { env } from "@/lib/env";
import { ImageEnlargeDialog } from "./items-table/image-enlarge-dialog";

interface ResolveDuplicatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dupeGroups: DuplicationGroup[];
  propertyId: string;
  unitId: string;
  collectionId: string;
  onResolved?: () => void;
}

export function ResolveDuplicatesDialog({
  open,
  onOpenChange,
  dupeGroups,
  propertyId,
  unitId,
  collectionId,
  onResolved,
}: ResolveDuplicatesDialogProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingAction, setLoadingAction] = useState<
    "keepSelection" | "removeAll" | "keepAll" | null
  >(null);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);
  const [showKeepAllDialog, setShowKeepAllDialog] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{
    url: string;
    alt: string;
    boundingBoxes: number[] | null;
  } | null>(null);
  const [resolvedGroupIds, setResolvedGroupIds] = useState<Set<string>>(
    new Set()
  );

  const isSubmitting = loadingAction !== null;

  const remainingGroups = dupeGroups.filter(
    (group) => !resolvedGroupIds.has(group.id)
  );
  const currentGroup = remainingGroups[currentGroupIndex];
  const totalGroups = remainingGroups.length;

  const handlePrevGroup = useCallback(() => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      setSelectedItemIds(new Set());
    }
  }, [currentGroupIndex]);

  const handleNextGroup = useCallback(() => {
    if (currentGroupIndex < totalGroups - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setSelectedItemIds(new Set());
    }
  }, [currentGroupIndex, totalGroups]);

  const handleDialogClose = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setCurrentGroupIndex(0);
        setSelectedItemIds(new Set());
        if (resolvedGroupIds.size > 0) {
          setResolvedGroupIds(new Set());
          onResolved?.();
        }
      }
    },
    [onOpenChange, resolvedGroupIds.size, onResolved]
  );

  const handleImageClick = useCallback(
    (imageUrl: string, itemName: string, boundingBoxes: number[] | null) => {
      setEnlargedImage({ url: imageUrl, alt: itemName, boundingBoxes });
    },
    []
  );

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleGroupResolved = useCallback(
    (groupId: string) => {
      setResolvedGroupIds((prev) => new Set(prev).add(groupId));
      setSelectedItemIds(new Set());

      const newRemainingCount = remainingGroups.length - 1;

      if (newRemainingCount === 0) {
        onOpenChange(false);
        setCurrentGroupIndex(0);
        setResolvedGroupIds(new Set());
        onResolved?.();
      } else if (currentGroupIndex >= newRemainingCount) {
        setCurrentGroupIndex(newRemainingCount - 1);
      }
    },
    [remainingGroups.length, currentGroupIndex, onOpenChange, onResolved]
  );

  const handleKeepAll = useCallback(async () => {
    setShowKeepAllDialog(false);
    if (!currentGroup) return;

    setLoadingAction("keepAll");
    try {
      const result = await resolveDuplicationGroup(
        propertyId,
        unitId,
        collectionId,
        currentGroup.id,
        []
      );

      if (result.success) {
        toast.success("All items kept");
        handleGroupResolved(currentGroup.id);
      } else {
        toast.error(result.message || "Failed to keep items");
      }
    } catch {
      toast.error("Failed to keep items");
    } finally {
      setLoadingAction(null);
    }
  }, [
    currentGroup,
    propertyId,
    unitId,
    collectionId,
    handleGroupResolved,
  ]);

  const handleKeepSelection = useCallback(async () => {
    if (!currentGroup || selectedItemIds.size === 0) return;

    setLoadingAction("keepSelection");
    try {
      const itemIdsToDelete = currentGroup.items
        .filter((item) => !selectedItemIds.has(item.id))
        .map((item) => item.id);

      const result = await resolveDuplicationGroup(
        propertyId,
        unitId,
        collectionId,
        currentGroup.id,
        itemIdsToDelete
      );

      if (result.success) {
        toast.success("Duplicates resolved successfully");
        handleGroupResolved(currentGroup.id);
      } else {
        toast.error(result.message || "Failed to resolve duplicates");
      }
    } catch {
      toast.error("Failed to resolve duplicates");
    } finally {
      setLoadingAction(null);
    }
  }, [
    currentGroup,
    selectedItemIds,
    propertyId,
    unitId,
    collectionId,
    handleGroupResolved,
  ]);

  const handleRemoveAll = useCallback(async () => {
    setShowRemoveAllDialog(false);
    if (!currentGroup) return;

    setLoadingAction("removeAll");
    try {
      const allItemIds = currentGroup.items.map((item) => item.id);

      const result = await resolveDuplicationGroup(
        propertyId,
        unitId,
        collectionId,
        currentGroup.id,
        allItemIds
      );

      if (result.success) {
        toast.success("All duplicates removed");
        handleGroupResolved(currentGroup.id);
      } else {
        toast.error(result.message || "Failed to remove duplicates");
      }
    } catch {
      toast.error("Failed to remove duplicates");
    } finally {
      setLoadingAction(null);
    }
  }, [
    currentGroup,
    propertyId,
    unitId,
    collectionId,
    handleGroupResolved,
  ]);

  if (totalGroups === 0 || !currentGroup) return null;

  const paginationFooter = (
    <div className="flex items-center justify-between w-full">
      <p className="text-sm text-muted-foreground">
        {currentGroupIndex + 1} of {totalGroups}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevGroup}
          disabled={currentGroupIndex === 0 || isSubmitting}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} className="text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextGroup}
          disabled={currentGroupIndex === totalGroups - 1 || isSubmitting}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <TugboatModal
      open={open}
      onOpenChange={handleDialogClose}
      title="Resolve duplicates"
      showCloseButton
      footer={paginationFooter}
      className="max-w-[872px]"
    >
      <div className="bg-accent/50 border border-accent-border rounded-lg px-3 py-2.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-medium text-base">Possible duplicates</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveAllDialog(true)}
              disabled={isSubmitting}
              className="text-destructive hover:text-destructive"
            >
              Remove All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeepAllDialog(true)}
              disabled={isSubmitting}
            >
              Keep All
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2.5 w-full max-h-[300px] overflow-y-auto">
            {currentGroup.items.map((item) => (
              <DuplicateItemRow
                key={item.id}
                item={item}
                isSelected={selectedItemIds.has(item.id)}
                onToggle={() => toggleItemSelection(item.id)}
                onImageClick={handleImageClick}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <div className="flex items-center justify-between w-full">
            {selectedItemIds.size > 0 && (
              <div className="flex items-center gap-1.5">
                <CircleAlert className="h-3 w-3 text-destructive shrink-0" />
                <p className="text-sm text-destructive leading-none">
                  Other duplicates will be deleted once you confirm.
                </p>
              </div>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handleKeepSelection}
              disabled={selectedItemIds.size === 0 || isSubmitting}
              loading={loadingAction === "keepSelection"}
              className={selectedItemIds.size === 0 ? "ml-auto" : ""}
            >
              Keep Selection
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showRemoveAllDialog}
        onOpenChange={setShowRemoveAllDialog}
        title="Remove items?"
        description="Are you sure you want to remove all duplicates? This action can't be undone."
        confirmText="Remove"
        onConfirm={handleRemoveAll}
        isLoading={loadingAction === "removeAll"}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showKeepAllDialog}
        onOpenChange={setShowKeepAllDialog}
        title="Keep all items?"
        description="Are you sure you want to keep all duplicates?"
        confirmText="Keep All"
        onConfirm={handleKeepAll}
        isLoading={loadingAction === "keepAll"}
        variant="default"
      />

      <ImageEnlargeDialog
        open={!!enlargedImage}
        onOpenChange={(open) => !open && setEnlargedImage(null)}
        imageUrl={enlargedImage?.url ?? null}
        alt={enlargedImage?.alt}
        boundingBoxes={enlargedImage?.boundingBoxes ?? null}
      />
    </TugboatModal>
  );
}

interface DuplicateItemRowProps {
  item: Item;
  isSelected: boolean;
  onToggle: () => void;
  onImageClick: (
    imageUrl: string,
    itemName: string,
    boundingBoxes: number[] | null
  ) => void;
  disabled?: boolean;
}

function DuplicateItemRow({
  item,
  isSelected,
  onToggle,
  onImageClick,
  disabled,
}: DuplicateItemRowProps) {
  const fullImageUrl = item.photo_url
    ? env.NEXT_PUBLIC_STORAGE_URL + item.photo_url
    : null;

  return (
    <div
      className="bg-background border border-accent-border rounded-xl shadow-sm flex items-center justify-between pl-2 pr-6 py-2 w-full cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => !disabled && onToggle()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-md overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (fullImageUrl) {
              onImageClick(
                fullImageUrl,
                item.name || "Unnamed Item",
                item.bounding_box
              );
            }
          }}
        >
          {fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Qty: {item.quantity ?? 1}
          </p>
          <p className="font-medium text-base">{item.name || "Unnamed Item"}</p>
          <p className="text-sm text-foreground">{item.brand?.name || ""}</p>
        </div>
      </div>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
