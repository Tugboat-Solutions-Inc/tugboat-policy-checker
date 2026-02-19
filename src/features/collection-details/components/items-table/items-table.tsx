"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { TableMeta, RowSelectionState } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/data-table";
import { ItemsTableFilters } from "./items-table-filters";
import { AddItemsDropdown } from "../add-items-dropdown";
import { UploadPhotosDialog } from "@/components/common/upload-photos-dialog";
import { AddItemManuallyDialog } from "@/components/common/add-item-manually-dialog";
import { itemsTableColumns } from "./items-table-columns";
import { deleteItems, createItem } from "../../api/item.actions";
import { usePermissions } from "@/components/common/permissions-provider";
import { CAPABILITIES } from "@/constants/permissions.constants";
import type { CollectionItem } from "../../types/collection-details.types";
import { InventoryTemplateDialog } from "../template-inventory/inventory-template-dialog";
import { ItemDetailsSheet } from "../item-details-sheet";
import { ImageEnlargeDialog } from "./image-enlarge-dialog";
import type {
  CreateItemInput,
  Item,
  ItemCondition,
} from "../../types/item.types";
import type { Brand } from "../../types/brand.types";
import type { Category } from "../../types/category.types";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { toast } from "@/components/common/toast/toast";
import {
  useItemsPagination,
  mapItemToCollectionItem,
} from "../../hooks/use-items-pagination";
import { useItemsEditMode } from "../../hooks/use-items-edit-mode";
import { createCategory, getCategories } from "../../api/category.actions";
import { createBrand, getBrands } from "../../api/brand.actions";
import { convertImageToBase64, isValidUUID } from "@/lib/utils";
import type { AddItemFormData } from "@/components/common/add-item-manually-dialog";
import { prefetchTemplate } from "../../hooks/use-template-cache";

interface ItemsTableProps {
  propertyId: string;
  unitId: string;
  collectionId: string;
  collectionName: string;
  initialItems: Item[];
  initialBrands?: Brand[];
  initialCategories?: Category[];
  initialPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

type DialogType = "upload" | "addManually" | "template" | "delete" | null;

export function ItemsTable({
  propertyId,
  unitId,
  collectionId,
  collectionName,
  initialItems,
  initialBrands,
  initialCategories,
  initialPagination,
}: ItemsTableProps) {
  const { can } = usePermissions();
  const viewOnly = !can(CAPABILITIES.EDIT_COLLECTIONS);
  const hasInitialBrandsCategories =
    initialBrands !== undefined && initialCategories !== undefined;
  const [brands, setBrands] = useState<Brand[]>(() => initialBrands ?? []);
  const [categories, setCategories] = useState<Category[]>(() => initialCategories ?? []);
  const [isLoadingBrandsCategories, setIsLoadingBrandsCategories] = useState(
    !hasInitialBrandsCategories
  );

  useEffect(() => {
    prefetchTemplate();

    if (hasInitialBrandsCategories) {
      return;
    }

    const loadBrandsAndCategories = async () => {
      setIsLoadingBrandsCategories(true);
      try {
        const [brandsResult, categoriesResult] = await Promise.all([
          getBrands(propertyId, unitId),
          getCategories(propertyId, unitId),
        ]);

        if (brandsResult.success) {
          setBrands(brandsResult.data.data);
        }
        if (categoriesResult.success) {
          setCategories(categoriesResult.data.data);
        }
      } catch (error) {
        console.error("Failed to load brands/categories:", error);
      } finally {
        setIsLoadingBrandsCategories(false);
      }
    };

    loadBrandsAndCategories();
  }, [propertyId, unitId, hasInitialBrandsCategories]);

  const {
    items,
    setItems,
    isLoading,
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    filters,
    setFilters,
    pagination,
    refetch,
    clearCache,
  } = useItemsPagination({
    propertyId,
    unitId,
    collectionId,
    initialItems,
    initialPagination,
  });

  const {
    isEditMode,
    isSaving,
    lastSaved,
    saveError,
    updateData,
    startEdit,
    handleDoneEdit,
  } = useItemsEditMode({
    propertyId,
    unitId,
    collectionId,
    items,
    setItems,
    onSaveComplete: clearCache,
  });

  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{
    url: string;
    alt: string;
    boundingBoxes: number[] | null;
  } | null>(null);

  // Accumulate unique categories/brands seen across all loaded pages so the
  // filter dropdowns aren't limited to just the current page.
  const seenCategoriesRef = useRef<Map<string, string>>(new Map());
  const seenBrandsRef = useRef<Map<string, string>>(new Map());
  const [filterCategories, setFilterCategories] = useState<{ id: string; name: string }[]>([]);
  const [filterBrands, setFilterBrands] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let changed = false;
    items.forEach((item) => {
      if (item.categoryId && item.category && !seenCategoriesRef.current.has(item.categoryId)) {
        seenCategoriesRef.current.set(item.categoryId, item.category);
        changed = true;
      }
      if (item.brandId && item.brand && !seenBrandsRef.current.has(item.brandId)) {
        seenBrandsRef.current.set(item.brandId, item.brand);
        changed = true;
      }
    });
    if (changed) {
      setFilterCategories(
        Array.from(seenCategoriesRef.current.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setFilterBrands(
        Array.from(seenBrandsRef.current.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [items]);

  const handleItemClick = useCallback((item: CollectionItem) => {
    setSelectedItem(item);
    setIsItemSheetOpen(true);
  }, []);

  const handleImageClick = useCallback(
    (imageUrl: string, itemName: string, boundingBoxes: number[] | null) => {
      setEnlargedImage({ url: imageUrl, alt: itemName, boundingBoxes });
    },
    []
  );

  const tableMeta: TableMeta<CollectionItem> = useMemo(
    () => ({
      isEditMode,
      updateData,
      onItemClick: handleItemClick,
      onImageClick: handleImageClick,
      brands,
      categories,
    }),
    [
      isEditMode,
      updateData,
      handleItemClick,
      handleImageClick,
      brands,
      categories,
    ]
  );

  const selectedItemIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  );

  const handleOpenDeleteDialog = useCallback(() => {
    setItemsToDelete([...selectedItemIds]);
    setActiveDialog("delete");
  }, [selectedItemIds]);

  const handleConfirmDelete = useCallback(async () => {
    if (itemsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const result = await deleteItems(
        propertyId,
        unitId,
        collectionId,
        itemsToDelete
      );

      if (result.success) {
        clearCache();
        setRowSelection({});
        setItemsToDelete([]);
        toast.success(
          `${itemsToDelete.length} item${itemsToDelete.length === 1 ? " was" : "s were"} deleted`
        );
        await refetch();
      } else {
        toast.error("Failed to delete items");
      }
    } finally {
      setIsDeleting(false);
    }
  }, [itemsToDelete, propertyId, unitId, collectionId, refetch, clearCache]);

  const closeDialog = useCallback(() => setActiveDialog(null), []);

  const handleAddItem = useCallback(
    async (formData: AddItemFormData): Promise<boolean> => {
      if (isAddingItem) return false;

      setIsAddingItem(true);
      try {
        let categoryId = formData.category_id;
        let brandId = formData.brand_id;
        let categoryName = formData.category_id;
        let brandName = formData.brand_id;

        if (categoryId && !isValidUUID(categoryId)) {
          const categoryResult = await createCategory(propertyId, unitId, {
            name: categoryId,
          });
          if (!categoryResult.success) {
            toast.error("Failed to create category");
            return false;
          }
          categoryName = categoryId;
          categoryId = categoryResult.data.id;
        }

        if (brandId && !isValidUUID(brandId)) {
          const brandResult = await createBrand(propertyId, unitId, {
            name: brandId,
          });
          if (!brandResult.success) {
            toast.error("Failed to create brand");
            return false;
          }
          brandName = brandId;
          brandId = brandResult.data.id;
        }

        const photoB64 = await convertImageToBase64(formData.imageFile);

        const itemInput: CreateItemInput = {
          name: formData.name,
          category_id: categoryId,
          item_condition: formData.item_condition as ItemCondition,
          description: formData.description || undefined,
          brand_id: brandId || undefined,
          model_nr: formData.model_nr || undefined,
          est_age: Number(formData.est_age) || undefined,
          quantity: Number(formData.quantity) || 0,
          est_cost: Number(formData.est_cost) || undefined,
          photo_b64: photoB64 || undefined,
        };

        const result = await createItem(
          propertyId,
          unitId,
          collectionId,
          itemInput
        );
        if (result.success) {
          const newItem = mapItemToCollectionItem(result.data);
          if (!newItem.category && categoryName) {
            newItem.category = categoryName;
          }
          if (!newItem.brand && brandName) {
            newItem.brand = brandName;
          }
          setItems((prev) => [newItem, ...prev]);
          clearCache();
          toast.success("Item added successfully");
          return true;
        } else {
          toast.error("Failed to add item");
          return false;
        }
      } finally {
        setIsAddingItem(false);
      }
    },
    [propertyId, unitId, collectionId, isAddingItem, setItems, clearCache]
  );

  return (
    <>
      <div className="h-full flex flex-col min-h-0 bg-background rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium leading-none">List of Items</h2>
          {!viewOnly && (
            <AddItemsDropdown
              onUploadPhotos={() => setActiveDialog("upload")}
              onAddManually={() => setActiveDialog("addManually")}
              onInventoryTemplate={() => setActiveDialog("template")}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <ItemsTableFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={filters}
            onFiltersChange={setFilters}
            isEditMode={isEditMode}
            isSaving={isSaving}
            lastSaved={lastSaved}
            saveError={saveError}
            onEditClick={startEdit}
            onDoneClick={handleDoneEdit}
            viewOnly={viewOnly}
            selectedCount={selectedItemIds.length}
            onDeleteClick={handleOpenDeleteDialog}
            brands={filterBrands}
            categories={filterCategories}
          />

          <DataTable
            columns={itemsTableColumns}
            data={items}
            isLoading={isLoading}
            pagination={{
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
              totalCount: pagination.totalItems,
              pageCount: pagination.totalPages,
              onPageChange: pagination.onPageChange,
            }}
            rowSelection={{
              state: rowSelection,
              onChange: setRowSelection,
            }}
            emptyState={
              debouncedSearchValue ||
              filters.brandIds.length > 0 ||
              filters.categoryIds.length > 0 ||
              filters.conditions.length > 0 ||
              filters.minValue !== null ||
              filters.maxValue !== null
                ? {
                    title: debouncedSearchValue
                      ? `No results for "${debouncedSearchValue}"`
                      : "No items match your filters",
                    subtitle:
                      "Try adjusting your search or filters to see more results.",
                  }
                : {
                    title: "No items in this collection yet",
                    subtitle:
                      "Start by uploading photos or adding items to build your collection.",
                  }
            }
            className="flex-1 min-h-0"
            meta={tableMeta}
            getRowId={(row) => row.id}
          />
        </div>

        <UploadPhotosDialog
          open={activeDialog === "upload"}
          onOpenChange={(open) => !open && closeDialog()}
          propertyId={propertyId}
          unitId={unitId}
          collectionId={collectionId}
          onUploadComplete={() => {
            clearCache();
            refetch();
          }}
        />

        <AddItemManuallyDialog
          open={activeDialog === "addManually"}
          onOpenChange={(open) => !open && closeDialog()}
          onAddItem={handleAddItem}
          propertyId={propertyId}
          unitId={unitId}
          collectionId={collectionId}
          isSubmitting={isAddingItem}
        />
      </div>

      <InventoryTemplateDialog
        open={activeDialog === "template"}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        onItemsAdded={refetch}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
        collectionName={collectionName}
      />

      <ItemDetailsSheet
        open={isItemSheetOpen}
        onOpenChange={setIsItemSheetOpen}
        item={selectedItem}
        propertyId={propertyId}
        unitId={unitId}
        collectionId={collectionId}
      />

      <ConfirmationDialog
        open={activeDialog === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        title={`Delete ${itemsToDelete.length} Item${itemsToDelete.length === 1 ? "" : "s"} from Inventory?`}
        description={`This will remove the item${itemsToDelete.length === 1 ? "" : "s"} and ${itemsToDelete.length === 1 ? "its" : "their"} details from your inventory. This action can't be undone.`}
        confirmText={`Delete item${itemsToDelete.length === 1 ? "" : "s"}`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <ImageEnlargeDialog
        open={!!enlargedImage}
        onOpenChange={(open) => !open && setEnlargedImage(null)}
        imageUrl={enlargedImage?.url ?? null}
        alt={enlargedImage?.alt}
        boundingBoxes={enlargedImage?.boundingBoxes ?? null}
      />
    </>
  );
}
