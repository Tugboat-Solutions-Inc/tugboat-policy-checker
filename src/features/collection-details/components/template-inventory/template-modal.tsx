"use client";

import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { TugboatModalFooter } from "@/components/common/tugboat-modal/tugboat-modal-footer";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import CollectionItem from "./collection-item";
import type { TemplateTableItem } from "./template-table-columns";
import { addItemsToCollection } from "../../api/template.actions";
import { toast } from "@/components/common/toast/toast";
import { getCategories, createCategory } from "../../api/category.actions";

interface TemplateModalProps {
  propertyId: string;
  unitId: string;
  collectionId: string;
  collectionName: string;
  selectedItems: TemplateTableItem[];
  onClose: () => void;
  onItemsAdded: () => void;
}

export default function TemplateModal({
  propertyId,
  unitId,
  collectionId,
  collectionName,
  selectedItems,
  onClose,
  onItemsAdded,
}: TemplateModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const checkedCount = useMemo(() => {
    return checkedItems.size;
  }, [checkedItems]);

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const handleAddItems = async () => {
    const checkedSelectedItems = selectedItems.filter((item) => checkedItems.has(item.id));

    if (checkedSelectedItems.length === 0) {
      toast.error("No items selected", "Please select at least one item to add");
      return;
    }

    setIsAdding(true);
    const loadingToast = toast.loading(
      "Adding items",
      `Adding ${checkedSelectedItems.length} ${checkedSelectedItems.length === 1 ? "item" : "items"} to ${collectionName}...`
    );

    try {
      const uniqueCategoryNames = [...new Set(
        checkedSelectedItems
          .map((item) => item.category)
          .filter((name): name is string => !!name && name !== "Uncategorized")
      )];

      const categoryNameToId: Record<string, string> = {};

      if (uniqueCategoryNames.length > 0) {
        const existingCategoriesResult = await getCategories(propertyId, unitId);
        const existingCategories = existingCategoriesResult.success 
          ? existingCategoriesResult.data.data 
          : [];

        for (const categoryName of uniqueCategoryNames) {
          const existing = existingCategories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase()
          );

          if (existing) {
            categoryNameToId[categoryName] = existing.id;
          } else {
            const createResult = await createCategory(propertyId, unitId, { name: categoryName });
            if (createResult.success) {
              categoryNameToId[categoryName] = createResult.data.id;
            }
          }
        }
      }

      const itemsToAdd = checkedSelectedItems.map((item) => ({
        name: item.name,
        item_condition: "GOOD" as const,
        category_id: item.category && item.category !== "Uncategorized"
          ? categoryNameToId[item.category]
          : undefined,
      }));

      const result = await addItemsToCollection(
        propertyId,
        unitId,
        collectionId,
        itemsToAdd
      );

      toast.dismiss(loadingToast);

      if (result.success && result.data) {
        const { success, failed } = result.data;
        if (failed === 0) {
          toast.success(
            "Items added",
            `Successfully added ${success} ${success === 1 ? "item" : "items"} to ${collectionName}`
          );
        } else {
          toast.warning(
            "Partially added",
            `Added ${success} ${success === 1 ? "item" : "items"} to ${collectionName}, ${failed} ${failed === 1 ? "item" : "items"} failed`
          );
        }
        setIsModalOpen(false);
        onItemsAdded();
        onClose();
      } else {
        toast.error("Failed to add items", `Could not add items to ${collectionName}. Please try again.`);
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Failed to add items", `Could not add items to ${collectionName}. Please try again.`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (isAdding) return;
    setIsModalOpen(open);
    if (open) {
      setCheckedItems(new Set(selectedItems.map((item) => item.id)));
    }
  };

  const handleOpenModal = () => {
    setCheckedItems(new Set(selectedItems.map((item) => item.id)));
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant="default"
        className="h-9 py-2 px-3"
        onClick={handleOpenModal}
        disabled={selectedItems.length === 0}
      >
        Continue <ChevronRight className="h-4 w-4" />
      </Button>
      <TugboatModal
        open={isModalOpen}
        onOpenChange={handleOpenChange}
        showCloseButton={!isAdding}
        title={`Add Items to ${collectionName}`}
        description={`Review and confirm ${checkedCount} ${checkedCount === 1 ? "item" : "items"} to add`}
        maxWidth="lg"
        footer={
          <TugboatModalFooter
            onCancel={() => !isAdding && setIsModalOpen(false)}
            onNext={handleAddItems}
            nextLabel={`Add ${checkedCount} ${checkedCount === 1 ? "item" : "items"}`}
            showNextIcon={false}
            cancelLabel="Back"
            isNextDisabled={checkedCount === 0 || isAdding}
            isCancelDisabled={isAdding}
            isNextLoading={isAdding}
          />
        }
      >
        <div className="flex flex-col gap-3 max-h-[400px] overflow-auto">
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items selected
            </p>
          ) : (
            selectedItems.map((item) => (
              <CollectionItem
                key={item.id}
                name={item.name}
                category={item.category}
                area={item.areaName}
                checked={checkedItems.has(item.id)}
                onCheckedChange={(checked) => handleItemCheck(item.id, checked)}
              />
            ))
          )}
        </div>
      </TugboatModal>
    </>
  );
}
