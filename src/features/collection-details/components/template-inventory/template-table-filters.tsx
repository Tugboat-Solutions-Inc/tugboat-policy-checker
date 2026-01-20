"use client";

import { Search, ListFilter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateTableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  areas: { value: string; label: string }[];
  categories: { value: string; label: string }[];
  selectedItems: number;
  totalItems: number;
}

export function TemplateTableFilters({
  searchValue,
  onSearchChange,
  selectedArea,
  onAreaChange,
  selectedCategory,
  onCategoryChange,
  areas,
  categories,
  selectedItems,
  totalItems,
}: TemplateTableFiltersProps) {
  const getAreaLabel = () => {
    if (selectedArea === "all") return "Area";
    const area = areas.find((a) => a.value === selectedArea);
    return area?.label || "Area";
  };

  const getCategoryLabel = () => {
    if (selectedCategory === "all") return "Category";
    const category = categories.find((c) => c.value === selectedCategory);
    return category?.label || "Category";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <ListFilter className="h-4 w-4 text-foreground" />

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  {getAreaLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-auto">
                <DropdownMenuItem onClick={() => onAreaChange("all")}>
                  All Areas
                </DropdownMenuItem>
                {areas.map((area) => (
                  <DropdownMenuItem
                    key={area.value}
                    onClick={() => onAreaChange(area.value)}
                  >
                    {area.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  {getCategoryLabel()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px] overflow-auto">
                <DropdownMenuItem onClick={() => onCategoryChange("all")}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                  >
                    {category.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">
          {totalItems} {totalItems === 1 ? "item" : "items"} total
        </span>
        <span className="text-foreground text-sm font-medium">
          {selectedItems} {selectedItems === 1 ? "item" : "items"} selected
        </span>
      </div>
    </div>
  );
}
