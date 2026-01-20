"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { updateItem } from "../api/item.actions";
import type { ItemCondition, UpdateItemInput } from "../types/item.types";
import type { CollectionItem } from "../types/collection-details.types";

function mapConditionToApi(
  uiCondition: CollectionItem["condition"]
): ItemCondition {
  const conditionMap: Record<CollectionItem["condition"], ItemCondition> = {
    fair: "FAIR",
    good: "GOOD",
    new: "BRAND_NEW",
  };
  return conditionMap[uiCondition];
}

function buildUpdatePayload(
  item: CollectionItem,
  changes: Partial<CollectionItem>
): UpdateItemInput {
  return {
    name: (changes.name as string) ?? item.name,
    description: (changes.description as string) ?? item.description,
    model_nr: (changes.model as string) ?? item.model,
    item_condition: changes.condition
      ? mapConditionToApi(changes.condition)
      : mapConditionToApi(item.condition),
    est_age: (changes.age as number) ?? item.age,
    quantity: (changes.quantity as number) ?? item.quantity,
    est_cost: (changes.itemValue as number) ?? item.itemValue,
    brand_id:
      "brandId" in changes
        ? ((changes.brandId as string | null) ?? undefined)
        : (item.brandId ?? undefined),
    category_id:
      "categoryId" in changes
        ? ((changes.categoryId as string | null) ?? undefined)
        : (item.categoryId ?? undefined),
  };
}

type UseItemsEditModeParams = {
  propertyId: string;
  unitId: string;
  collectionId: string;
  items: CollectionItem[];
  setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  onSaveComplete?: () => void;
};

export function useItemsEditMode({
  propertyId,
  unitId,
  collectionId,
  items,
  setItems,
  onSaveComplete,
}: UseItemsEditModeParams) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const pendingChangesRef = useRef<Map<string, Partial<CollectionItem>>>(
    new Map()
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const saveChanges = useCallback(async () => {
    const changes = pendingChangesRef.current;
    if (changes.size === 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatePromises = Array.from(changes.entries())
        .map(([itemId, itemChanges]) => {
          const currentItem = itemsRef.current.find(
            (item) => item.id === itemId
          );
          if (!currentItem) return null;

          return updateItem(
            itemId,
            propertyId,
            unitId,
            collectionId,
            buildUpdatePayload(currentItem, itemChanges)
          );
        })
        .filter(Boolean);

      const results = await Promise.all(updatePromises);
      const failedResult = results.find((r) => r && !r.success);

      if (failedResult && !failedResult.success) {
        throw new Error(failedResult.message || "Failed to save");
      }

      pendingChangesRef.current.clear();
      setLastSaved(new Date());
      onSaveComplete?.();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, unitId, collectionId, onSaveComplete]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveChanges, 1000);
  }, [saveChanges]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const updateData = useCallback(
    (
      rowId: string,
      columnId: string,
      value: unknown,
      additionalFields?: Record<string, unknown>
    ) => {
      setItems((old) =>
        old.map((item) => {
          if (item.id === rowId) {
            const updatedItem = {
              ...item,
              [columnId]: value,
              ...additionalFields,
            };
            if (columnId === "quantity" || columnId === "itemValue") {
              updatedItem.totalValue =
                updatedItem.quantity * updatedItem.itemValue;
            }
            return updatedItem;
          }
          return item;
        })
      );

      const existing = pendingChangesRef.current.get(rowId) || {};
      pendingChangesRef.current.set(rowId, {
        ...existing,
        [columnId]: value,
        ...additionalFields,
      });

      debouncedSave();
    },
    [debouncedSave, setItems]
  );

  const handleDoneEdit = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      await saveChanges();
      setIsEditMode(false);
    } catch {
      // Stay in edit mode, error is already set by saveChanges
    }
  }, [saveChanges]);

  const startEdit = useCallback(() => setIsEditMode(true), []);

  return {
    isEditMode,
    isSaving,
    lastSaved,
    saveError,
    updateData,
    startEdit,
    handleDoneEdit,
  };
}
