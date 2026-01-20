"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/common/searchable-select";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { getCategories } from "@/features/collection-details/api/category.actions";
import { getBrands } from "@/features/collection-details/api/brand.actions";

import { CONDITION_OPTIONS } from "@/features/collection-details/types/item.types";

export interface AddItemFormData {
  name: string;
  category_id: string;
  item_condition: string;
  description: string;
  model_nr: string;
  est_cost: number;
  est_age: number;
  quantity: number;
  brand_id: string;
  imageFile?: File;
}

interface AddItemManuallyDialogProps {
  propertyId: string;
  unitId: string;
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem?: (item: AddItemFormData) => Promise<boolean> | boolean | void;
  isSubmitting?: boolean;
}

async function getCategoryOptions(propertyId: string, unitId: string) {
  const result = await getCategories(propertyId, unitId);
  if (result.success) {
    return result.data.data.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }
  return [];
}

async function getBrandOptions(propertyId: string, unitId: string) {
  const result = await getBrands(propertyId, unitId);
  if (result.success) {
    return result.data.data.map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));
  }
  return [];
}

const initialFormData: AddItemFormData = {
  name: "",
  description: "",
  category_id: "",
  brand_id: "",
  model_nr: "",
  item_condition: "",
  est_age: 0,
  quantity: 0,
  est_cost: 0,
};

export function AddItemManuallyDialog({
  propertyId,
  unitId,
  collectionId,
  open,
  onOpenChange,
  onAddItem,
  isSubmitting = false,
}: AddItemManuallyDialogProps) {
  const [formData, setFormData] = useState<AddItemFormData>(initialFormData);
  const [addMoreItems, setAddMoreItems] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    if (unitId) {
      getCategoryOptions(propertyId, unitId).then((options) => {
        setCategoryOptions(options);
      });
      getBrandOptions(propertyId, unitId).then((options) => {
        setBrandOptions(options);
      });
    }
  }, [unitId, propertyId]);

  const handleChange = (
    field: keyof AddItemFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleAddItem = async () => {
    if (isSubmitting) return;
    const result = await onAddItem?.(formData);
    const success = result !== false;

    if (success) {
      if (addMoreItems) {
        setFormData(initialFormData);
        setImagePreview(null);
      } else {
        handleClose();
      }
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setAddMoreItems(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    onOpenChange(false);
  };

  const isValid =
    formData.name.trim().length > 0 &&
    formData.category_id.trim().length > 0 &&
    formData.item_condition.trim().length > 0 &&
    Number(formData.quantity) > 0;

  return (
    <TugboatModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else onOpenChange(isOpen);
      }}
      title="Add Item Manually"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-foreground">
              Add more items
            </span>
            <Switch checked={addMoreItems} onCheckedChange={setAddMoreItems} />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="bg-accent-border hover:bg-accent-border/80"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!isValid || isSubmitting} loading={isSubmitting}>
              Add item
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-6">
          <div className="shrink-0 w-[151px] flex flex-col gap-2">
            <span className="text-sm font-medium leading-none">Add Image</span>
            <label className="flex h-[150px] w-[151px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-input bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-input bg-background">
                    <Upload className="size-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Upload Image
                  </span>
                </>
              )}
            </label>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <Field className="gap-2">
              <FieldLabel>Item Name*</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter item name"
                className="h-12 shadow-none"
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel>Category*</FieldLabel>
              <SearchableSelect
                options={categoryOptions}
                value={formData.category_id}
                onValueChange={(value) => handleChange("category_id", value)}
                onOptionsChange={setCategoryOptions}
                placeholder="Select category"
                allowCreate
                triggerClassName="h-12 shadow-none"
              />
            </Field>
          </div>
        </div>
        <Field className="gap-2">
          <div className="flex justify-between">
            <FieldLabel>Description</FieldLabel>
            <FieldDescription>
              {formData.description.length}/180
            </FieldDescription>
          </div>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Enter description"
            className="h-[68px] resize-none shadow-none focus:border-foreground focus:border"
            maxLength={180}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field className="gap-2">
            <FieldLabel>Brand</FieldLabel>
            <SearchableSelect
              options={brandOptions}
              value={formData.brand_id}
              onValueChange={(value) => handleChange("brand_id", value)}
              onOptionsChange={setBrandOptions}
              placeholder="Select brand"
              allowCreate
              triggerClassName="h-12 shadow-none"
            />
          </Field>

          <Field className="gap-2">
            <FieldLabel>Model</FieldLabel>
            <Input
              value={formData.model_nr}
              onChange={(e) => handleChange("model_nr", e.target.value)}
              placeholder="Enter model"
              className="h-12 shadow-none"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field className="gap-2">
            <FieldLabel>Condition*</FieldLabel>
            <Select
              value={formData.item_condition}
              onValueChange={(value) => handleChange("item_condition", value)}
            >
              <SelectTrigger className="h-12! shadow-none ">
                <SelectValue placeholder="Choose condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field className="gap-2">
            <FieldLabel>Age</FieldLabel>
            <Input
              value={formData.est_age}
              onChange={(e) => handleChange("est_age", e.target.value)}
              placeholder="Enter Age"
              className="h-12 shadow-none"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field className="gap-2">
            <FieldLabel>Quantity*</FieldLabel>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="Enter Quantity"
              className="h-12 shadow-none"
              min="1"
            />
          </Field>

          <Field className="gap-2">
            <FieldLabel>Item Value</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground-2">
                $
              </span>
              <Input
                type="number"
                value={formData.est_cost}
                onChange={(e) => handleChange("est_cost", e.target.value)}
                placeholder="100"
                className="h-12 pl-7 shadow-none"
              />
            </div>
          </Field>
        </div>
      </div>
    </TugboatModal>
  );
}
