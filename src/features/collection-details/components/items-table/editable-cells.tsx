"use client";

import { useState, useEffect, useRef } from "react";
import { CellContext, RowData } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CollectionItem,
  ItemCondition,
} from "../../types/collection-details.types";
import type { Brand } from "../../types/brand.types";
import type { Category } from "../../types/category.types";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    isEditMode?: boolean;
    updateData?: (
      rowId: string,
      columnId: string,
      value: unknown,
      additionalFields?: Record<string, unknown>
    ) => void;
    onItemClick?: (item: CollectionItem) => void;
    onImageClick?: (
      imageUrl: string,
      itemName: string,
      boundingBoxes: number[] | null
    ) => void;
    brands?: Brand[];
    categories?: Category[];
  }
}

interface EditableTextCellProps {
  getValue: () => unknown;
  row: { original: CollectionItem };
  column: { id: string };
  table: CellContext<CollectionItem, unknown>["table"];
  className?: string;
  truncate?: boolean;
}

export function EditableTextCell({
  getValue,
  row,
  column,
  table,
  className,
  truncate = false,
}: EditableTextCellProps) {
  const initialValue = getValue() as string;
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditMode = table.options.meta?.isEditMode ?? false;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isEditMode) {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }, [isEditMode]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    table.options.meta?.updateData?.(row.original.id, column.id, newValue);
  };

  const handleFocus = () => {
    if (isEditMode) {
      setIsFocused(true);
      inputRef.current?.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  if (!isEditMode) {
    return (
      <span
        className={cn(
          "text-sm text-foreground block py-2",
          truncate && "truncate max-w-[400px]",
          className
        )}
      >
        {value || initialValue}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full bg-transparent text-sm text-foreground py-2 px-2 rounded-md outline-none transition-colors",
        isFocused
          ? "bg-background border border-border shadow-sm font-medium"
          : "border border-transparent hover:bg-accent/50 cursor-text",
        className
      )}
    />
  );
}

export function NameCellWithIcon({
  getValue,
  row,
  column,
  table,
  className,
}: EditableTextCellProps) {
  const initialValue = getValue() as string;
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditMode = table.options.meta?.isEditMode ?? false;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isEditMode) {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }, [isEditMode]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    table.options.meta?.updateData?.(row.original.id, column.id, newValue);
  };

  const handleFocus = () => {
    if (isEditMode) {
      setIsFocused(true);
      inputRef.current?.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    table.options.meta?.onItemClick?.(row.original);
  };

  if (!isEditMode) {
    return (
      <div
        className="flex items-center gap-2 group cursor-pointer"
        onClick={handleIconClick}
      >
        <span className={cn("text-sm text-foreground py-2", className)}>
          {value || initialValue}
        </span>
        <ArrowUpRight
          className={cn(
            "size-4 text-muted-foreground group-hover:text-foreground transition-all flex-shrink-0",
            "opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0"
          )}
        />
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full bg-transparent text-sm text-foreground py-2 px-2 rounded-md outline-none transition-colors",
        isFocused
          ? "bg-background border border-border shadow-sm font-medium"
          : "border border-transparent hover:bg-accent/50 cursor-text",
        className
      )}
    />
  );
}

interface EditableNumberCellProps {
  getValue: () => unknown;
  row: { original: CollectionItem };
  column: { id: string };
  table: CellContext<CollectionItem, unknown>["table"];
  className?: string;
  formatFn?: (value: number) => string;
}

export function EditableNumberCell({
  getValue,
  row,
  column,
  table,
  className,
  formatFn,
}: EditableNumberCellProps) {
  const initialValue = getValue() as number;
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    formatFn ? formatFn(initialValue) : String(initialValue)
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditMode = table.options.meta?.isEditMode ?? false;

  useEffect(() => {
    setValue(initialValue);
    if (!isFocused) {
      setDisplayValue(formatFn ? formatFn(initialValue) : String(initialValue));
    }
  }, [initialValue, formatFn, isFocused]);

  useEffect(() => {
    if (!isEditMode) {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }, [isEditMode]);

  const handleFocus = () => {
    if (isEditMode) {
      setIsFocused(true);
      setDisplayValue(String(value));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = Number(displayValue) || 0;
    setValue(numValue);
    setDisplayValue(formatFn ? formatFn(numValue) : String(numValue));
    table.options.meta?.updateData?.(row.original.id, column.id, numValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  if (!isEditMode) {
    return (
      <span className={cn("text-xs font-medium py-2 block", className)}>
        {formatFn ? formatFn(value) : value}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type={isFocused ? "number" : "text"}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-20 bg-transparent text-xs font-medium py-2 px-2 rounded-md outline-none transition-colors",
        isFocused
          ? "bg-background border border-border shadow-sm"
          : "border border-transparent hover:bg-accent/50 cursor-text",
        className
      )}
    />
  );
}

export const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export const CONDITION_STYLES: Record<ItemCondition, string> = {
  good: "bg-[rgba(113,202,17,0.1)] text-[#71CA11] border-[rgba(113,202,17,0.1)]",
  fair: "bg-slate-400/10 text-slate-400 border-slate-400/10",
  new: "bg-blue-400/10 text-blue-400 border-blue-400/10",
};

interface EditableConditionCellProps {
  getValue: () => unknown;
  row: { original: CollectionItem };
  column: { id: string };
  table: CellContext<CollectionItem, unknown>["table"];
}

export function EditableConditionCell({
  getValue,
  row,
  column,
  table,
}: EditableConditionCellProps) {
  const initialValue = getValue() as ItemCondition;
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = table.options.meta?.isEditMode ?? false;

  useEffect(() => {
    if (!isEditMode) {
      setIsOpen(false);
    }
  }, [isEditMode]);

  const handleChange = (newValue: ItemCondition) => {
    table.options.meta?.updateData?.(row.original.id, column.id, newValue);
  };

  const badge = (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium border",
        CONDITION_STYLES[initialValue]
      )}
    >
      {CONDITION_OPTIONS.find((o) => o.value === initialValue)?.label}
    </span>
  );

  if (!isEditMode) {
    return badge;
  }

  return (
    <div className="min-h-[36px] flex items-center">
      <Select
        value={initialValue}
        onValueChange={handleChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={cn(
            "h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer",
            "py-2 px-2 rounded-md transition-all",
            isOpen && "bg-background border border-border shadow-sm",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          {badge}
        </SelectTrigger>
        <SelectContent
          align="start"
          className="max-h-[320px] [&_[data-slot=select-item]_svg]:!text-primary"
        >
          {CONDITION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface EditableCategoryCellProps {
  getValue: () => unknown;
  row: { original: CollectionItem };
  column: { id: string };
  table: CellContext<CollectionItem, unknown>["table"];
}

export function EditableCategoryCell({
  getValue,
  row,
  column,
  table,
}: EditableCategoryCellProps) {
  const initialValue = getValue() as string;
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = table.options.meta?.isEditMode ?? false;
  const categories = table.options.meta?.categories ?? [];
  const currentCategoryId = row.original.categoryId;

  useEffect(() => {
    if (!isEditMode) {
      setIsOpen(false);
    }
  }, [isEditMode]);

  const handleChange = (categoryId: string) => {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (selectedCategory) {
      table.options.meta?.updateData?.(
        row.original.id,
        "categoryId",
        categoryId,
        { category: selectedCategory.name }
      );
    }
  };

  if (!isEditMode) {
    return <span className="text-sm py-2 block">{initialValue}</span>;
  }

  return (
    <div className="min-h-[36px] flex items-center w-full">
      <Select
        value={currentCategoryId ?? ""}
        onValueChange={handleChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={cn(
            "h-auto w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer",
            "py-2 px-2 rounded-md transition-all",
            isOpen
              ? "bg-background border border-border shadow-sm font-medium"
              : "border border-transparent hover:bg-accent/50",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          <span className="text-sm block truncate">{initialValue}</span>
        </SelectTrigger>
        <SelectContent
          align="start"
          className="min-w-[200px] max-h-[320px] [&_[data-slot=select-item]_svg]:!text-primary"
        >
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface EditableBrandCellProps {
  getValue: () => unknown;
  row: { original: CollectionItem };
  column: { id: string };
  table: CellContext<CollectionItem, unknown>["table"];
}

export function EditableBrandCell({
  getValue,
  row,
  column,
  table,
}: EditableBrandCellProps) {
  const initialValue = getValue() as string;
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = table.options.meta?.isEditMode ?? false;
  const brands = table.options.meta?.brands ?? [];
  const currentBrandId = row.original.brandId;

  useEffect(() => {
    if (!isEditMode) {
      setIsOpen(false);
    }
  }, [isEditMode]);

  const handleChange = (brandId: string) => {
    const selectedBrand = brands.find((b) => b.id === brandId);
    if (selectedBrand) {
      table.options.meta?.updateData?.(row.original.id, "brandId", brandId, {
        brand: selectedBrand.name,
      });
    }
  };

  if (!isEditMode) {
    return <span className="text-sm py-2 block">{initialValue}</span>;
  }

  return (
    <div className="min-h-[36px] flex items-center w-full">
      <Select
        value={currentBrandId ?? ""}
        onValueChange={handleChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={cn(
            "h-auto w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden cursor-pointer",
            "py-2 px-2 rounded-md transition-all",
            isOpen
              ? "bg-background border border-border shadow-sm font-medium"
              : "border border-transparent hover:bg-accent/50",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          <span className="text-sm block truncate">{initialValue}</span>
        </SelectTrigger>
        <SelectContent
          align="start"
          className="max-h-[320px] [&_[data-slot=select-item]_svg]:!text-primary"
        >
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
