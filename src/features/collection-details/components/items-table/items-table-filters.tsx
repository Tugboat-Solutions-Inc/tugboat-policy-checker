"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Pen,
  Check,
  Trash,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type ItemFilters,
  CONDITION_OPTIONS,
} from "../../types/item-filters.types";

type FilterOption = { id: string; name: string };

interface ItemsTableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: ItemFilters;
  onFiltersChange: (filters: ItemFilters) => void;
  isEditMode: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  onEditClick: () => void;
  onDoneClick: () => void;
  viewOnly?: boolean;
  selectedCount?: number;
  onDeleteClick?: () => void;
  brands: FilterOption[];
  categories: FilterOption[];
}

function formatLastSaved(date: Date | null): string {
  if (!date) return "Auto-save";
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 5) return "Saved just now";
  if (diff < 60) return `Saved ${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Saved ${mins}m ago`;
  return "Auto-save";
}

function useTimeRefresh(lastSaved: Date | null, isEditMode: boolean) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isEditMode || !lastSaved) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSaved, isEditMode]);
}

function getActiveFilterCount(
  filters: ItemFilters,
  searchValue: string
): number {
  let count = 0;
  if (searchValue.trim()) count++;
  if (filters.brandIds.length > 0) count++;
  if (filters.categoryIds.length > 0) count++;
  if (filters.conditions.length > 0) count++;
  if (filters.minValue !== null || filters.maxValue !== null) count++;
  return count;
}

interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  labelPlural?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function MultiSelectDropdown({
  label,
  labelPlural,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [showBottomScroll, setShowBottomScroll] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTopScroll(el.scrollTop > 0);
    setShowBottomScroll(el.scrollTop < el.scrollHeight - el.clientHeight - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowBottomScroll(el.scrollHeight > el.clientHeight);
  }, [options]);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const displayLabel =
    selected.length > 0
      ? `${labelPlural ?? label} (${selected.length})`
      : (labelPlural ?? label);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 cursor-pointer"
        >
          {displayLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[200px] p-0 bg-white">
        <div className="flex flex-col">
          {showTopScroll && (
            <div className="flex justify-center py-1.5 border-b border-border bg-muted/30">
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div
            ref={scrollRef}
            className="max-h-[320px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {options.map((option) => (
              <div
                key={option.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-accent/50 transition-colors text-left cursor-pointer"
                onClick={() => toggleOption(option.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleOption(option.id);
                  }
                }}
              >
                <Checkbox
                  checked={selected.includes(option.id)}
                  onCheckedChange={() => toggleOption(option.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                />
                <span className="text-sm text-foreground truncate">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
          {showBottomScroll && (
            <div className="flex justify-center py-1.5 border-t border-border bg-muted/30">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ValueSliderFilterProps {
  minValue: number | null;
  maxValue: number | null;
  onChange: (minValue: number | null, maxValue: number | null) => void;
}

function ValueSliderFilter({
  minValue,
  maxValue,
  onChange,
}: ValueSliderFilterProps) {
  const MIN_BOUND = 0;
  const MAX_BOUND = 100000;
  const STEP = 100;

  const currentMin = minValue ?? MIN_BOUND;
  const currentMax = maxValue ?? MAX_BOUND;
  const [localRange, setLocalRange] = useState<[number, number]>([
    currentMin,
    currentMax,
  ]);
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));
  const hasFilter = minValue !== null && maxValue !== null;

  useEffect(() => {
    const newMin = minValue ?? MIN_BOUND;
    const newMax = maxValue ?? MAX_BOUND;
    setLocalRange([newMin, newMax]);
    setMinInput(String(newMin));
    setMaxInput(String(newMax));
  }, [minValue, maxValue]);

  const commitRange = (newMin: number, newMax: number) => {
    if (newMin === MIN_BOUND && newMax === MAX_BOUND) {
      onChange(null, null);
    } else {
      onChange(newMin, newMax);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalRange(newRange);
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
  };

  const handleSliderCommit = (value: number[]) => {
    commitRange(value[0], value[1]);
  };

  const handleReset = () => {
    setLocalRange([MIN_BOUND, MAX_BOUND]);
    setMinInput(String(MIN_BOUND));
    setMaxInput(String(MAX_BOUND));
    onChange(null, null);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
  };

  const handleMinInputBlur = () => {
    const parsed = parseInt(minInput, 10);
    if (isNaN(parsed)) {
      setMinInput(String(localRange[0]));
      return;
    }
    const clamped = Math.max(MIN_BOUND, Math.min(parsed, localRange[1]));
    setLocalRange([clamped, localRange[1]]);
    setMinInput(String(clamped));
    commitRange(clamped, localRange[1]);
  };

  const handleMaxInputBlur = () => {
    const parsed = parseInt(maxInput, 10);
    if (isNaN(parsed)) {
      setMaxInput(String(localRange[1]));
      return;
    }
    const clamped = Math.min(MAX_BOUND, Math.max(parsed, localRange[0]));
    setLocalRange([localRange[0], clamped]);
    setMaxInput(String(clamped));
    commitRange(localRange[0], clamped);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isMin: boolean
  ) => {
    if (e.key === "Enter") {
      if (isMin) {
        handleMinInputBlur();
      } else {
        handleMaxInputBlur();
      }
      (e.target as HTMLInputElement).blur();
    }
  };

  const displayLabel = hasFilter
    ? `Value ($${currentMin.toLocaleString()} - $${currentMax.toLocaleString()})`
    : "Value";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 cursor-pointer"
        >
          {displayLabel}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0 bg-white">
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border pt-2 pb-3 px-2">
            <span className="text-sm font-medium text-foreground leading-none">
              Choose Range
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer leading-none"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-4 p-3">
            <div className="px-1">
              <Slider
                value={localRange}
                min={MIN_BOUND}
                max={MAX_BOUND}
                step={STEP}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                className="cursor-pointer [&_[data-slot=slider-track]]:bg-input [&_[data-slot=slider-range]]:bg-foreground [&_[data-slot=slider-thumb]]:bg-foreground [&_[data-slot=slider-thumb]]:border-foreground [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:cursor-grab [&_[data-slot=slider-thumb]]:active:cursor-grabbing"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  Min price
                </label>
                <div className="flex items-center gap-0.5 border border-input rounded-lg px-2 py-[7px] bg-background hover:border-ring transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={minInput}
                    onChange={handleMinInputChange}
                    onBlur={handleMinInputBlur}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className="w-full text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={MIN_BOUND}
                    max={localRange[1]}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  Max price
                </label>
                <div className="flex items-center gap-0.5 border border-input rounded-lg px-2 py-[7px] bg-background hover:border-ring transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={maxInput}
                    onChange={handleMaxInputChange}
                    onBlur={handleMaxInputBlur}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className="w-full text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={localRange[0]}
                    max={MAX_BOUND}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ItemsTableFilters({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  isEditMode,
  isSaving,
  lastSaved,
  saveError,
  onEditClick,
  onDoneClick,
  viewOnly = false,
  selectedCount = 0,
  onDeleteClick,
  brands,
  categories,
}: ItemsTableFiltersProps) {
  useTimeRefresh(lastSaved, isEditMode);

  const hasSelection = selectedCount > 0;
  const activeFilterCount = getActiveFilterCount(filters, searchValue);

  const brandOptions: MultiSelectOption[] = brands.map((b) => ({
    id: b.id,
    label: b.name,
  }));

  const categoryOptions: MultiSelectOption[] = categories.map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const conditionOptions: MultiSelectOption[] = CONDITION_OPTIONS.map((c) => ({
    id: c.value,
    label: c.label,
  }));

  const handleBrandsChange = (brandIds: string[]) => {
    onFiltersChange({ ...filters, brandIds });
  };

  const handleCategoriesChange = (categoryIds: string[]) => {
    onFiltersChange({ ...filters, categoryIds });
  };

  const handleConditionsChange = (conditions: string[]) => {
    onFiltersChange({ ...filters, conditions });
  };

  const handleValueRangeChange = (
    minValue: number | null,
    maxValue: number | null
  ) => {
    onFiltersChange({ ...filters, minValue, maxValue });
  };

  const handleClearFilters = () => {
    onSearchChange("");
    onFiltersChange({
      brandIds: [],
      categoryIds: [],
      conditions: [],
      minValue: null,
      maxValue: null,
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <ListFilter className="h-4 w-4 text-foreground" />

          <div className="flex items-center gap-2">
            <MultiSelectDropdown
              label="Brands"
              options={brandOptions}
              selected={filters.brandIds}
              onChange={handleBrandsChange}
            />

            <MultiSelectDropdown
              label="Categories"
              options={categoryOptions}
              selected={filters.categoryIds}
              onChange={handleCategoriesChange}
            />

            <MultiSelectDropdown
              label="Conditions"
              options={conditionOptions}
              selected={filters.conditions}
              onChange={handleConditionsChange}
            />

            <ValueSliderFilter
              minValue={filters.minValue}
              maxValue={filters.maxValue}
              onChange={handleValueRangeChange}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 text-muted-foreground cursor-pointer"
                onClick={handleClearFilters}
              >
                <X className="h-3 w-3" />
                Clear
                <Badge variant="secondary" className="ml-1 px-1.5">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </div>

      {!viewOnly &&
        (hasSelection ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-9 gap-2 text-destructive hover:text-destructive/80 cursor-pointer"
            onClick={onDeleteClick}
          >
            <Trash className="h-4 w-4" />
            Delete {selectedCount} {selectedCount > 1 ? "items" : "item"}
          </Button>
        ) : isEditMode ? (
          <div className="flex items-center gap-3">
            {saveError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>Error saving</span>
              </div>
            ) : isSaving ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-2 bg-muted hover:bg-muted/80"
              onClick={onDoneClick}
              disabled={isSaving}
              loading={isSaving}
            >
              <Check className="h-4 w-4 text-primary" />
              Done
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 cursor-pointer"
            onClick={onEditClick}
          >
            <Pen className="h-4 w-4 text-primary" />
            Edit
          </Button>
        ))}
    </div>
  );
}
