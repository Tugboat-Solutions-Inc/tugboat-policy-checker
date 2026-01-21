"use client";

import { useState, useMemo, useEffect, Fragment, useCallback, memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TemplateTableFilters } from "./template-table-filters";
import { templateTableColumns, TemplateTableItem } from "./template-table-columns";
import { SortIcon } from "@/components/common/data-table/data-table-sort-icon";
import { DataTableEmptyRow } from "@/components/common/data-table/data-table-row";
import EmptyState from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import TemplateModal from "./template-modal";
import { type Template } from "../../api/template.actions";
import { useDebounce } from "@/hooks/use-debounce";

interface TemplateTableProps {
  propertyId: string;
  unitId: string;
  collectionId: string;
  collectionName: string;
  onClose: () => void;
  onItemsAdded?: () => void;
  template: Template;
}

export default function TemplateTable({
  propertyId,
  unitId,
  collectionId,
  collectionName,
  onClose,
  onItemsAdded,
  template,
}: TemplateTableProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(() => new Set());

  const debouncedSearch = useDebounce(searchValue, 300);

  const allItems: TemplateTableItem[] = useMemo(() => {
    const items: TemplateTableItem[] = [];
    template.collections.forEach((collection) => {
      collection.items.forEach((item) => {
        items.push({
          id: item.id,
          name: item.name,
          category: item.category?.name || "Uncategorized",
          categoryId: item.category?.id,
          area: collection.id,
          areaName: collection.name,
        });
      });
    });
    return items;
  }, [template]);

  const areas = useMemo(() => {
    return template.collections.map((collection) => ({
      value: collection.id,
      label: collection.name,
    }));
  }, [template]);

  const categories = useMemo(() => {
    return template.categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [template]);

  const areaLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    template.collections.forEach((collection) => {
      labels[collection.id] = collection.name;
    });
    return labels;
  }, [template]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedArea !== "all") {
      items = items.filter((item) => item.area === selectedArea);
    }

    if (selectedCategory !== "all") {
      items = items.filter((item) => item.categoryId === selectedCategory);
    }

    return items;
  }, [allItems, debouncedSearch, selectedArea, selectedCategory]);

  const expandAllAreas = useCallback(() => {
    const allAreaIds = new Set(filteredItems.map((item) => item.area));
    setExpandedAreas(allAreaIds);
  }, [filteredItems]);

  const collapseAllAreas = useCallback(() => {
    setExpandedAreas(new Set());
  }, []);

  // Don't auto-expand all areas - let user expand manually for better performance
  // useEffect(() => {
  //   const areaIds = new Set(filteredItems.map((item) => item.area));
  //   setExpandedAreas(areaIds);
  // }, [filteredItems]);

  useEffect(() => {
    setRowSelection({});
  }, [debouncedSearch, selectedArea, selectedCategory]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, TemplateTableItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.area]) {
        groups[item.area] = [];
      }
      groups[item.area].push(item);
    });
    return groups;
  }, [filteredItems]);

  const table = useReactTable({
    data: filteredItems,
    columns: templateTableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedItems = useMemo(() => {
    return filteredItems.filter((item) => rowSelection[item.id]);
  }, [filteredItems, rowSelection]);

  const toggleArea = useCallback((area: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) {
        next.delete(area);
      } else {
        next.add(area);
      }
      return next;
    });
  }, []);

  const sortedGroupedItems = useMemo(() => {
    if (sorting.length === 0) {
      return groupedItems;
    }

    const sortedGroups: Record<string, TemplateTableItem[]> = {};
    const sortFn = (a: TemplateTableItem, b: TemplateTableItem) => {
      for (const sort of sorting) {
        const aValue = a[sort.id as keyof TemplateTableItem];
        const bValue = b[sort.id as keyof TemplateTableItem];

        if (aValue === undefined || bValue === undefined) continue;
        if (aValue < bValue) return sort.desc ? 1 : -1;
        if (aValue > bValue) return sort.desc ? -1 : 1;
      }
      return 0;
    };

    Object.entries(groupedItems).forEach(([area, areaItems]) => {
      sortedGroups[area] = [...areaItems].sort(sortFn);
    });
    return sortedGroups;
  }, [groupedItems, sorting]);

  const areaOrder = useMemo(() => {
    return template.collections
      .map((c) => c.id)
      .filter((area) => Object.keys(sortedGroupedItems).includes(area));
  }, [template, sortedGroupedItems]);

  const getSelectedCountForArea = useCallback((area: string) => {
    const areaItems = sortedGroupedItems[area] || [];
    return areaItems.filter((item) => rowSelection[item.id]).length;
  }, [sortedGroupedItems, rowSelection]);

  const TemplateTableRow = memo(({ 
    item, 
    row, 
    onToggle 
  }: { 
    item: TemplateTableItem; 
    row: ReturnType<typeof table.getRowModel>['rows'][0];
    onToggle: () => void;
  }) => (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onToggle}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className={cn(
            "text-left",
            cell.column.id === "select" && "pr-0",
            cell.column.id === "name" && "pl-4"
          )}
        >
          {flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          )}
        </TableCell>
      ))}
    </TableRow>
  ));

  TemplateTableRow.displayName = "TemplateTableRow";

  const hasFilters = debouncedSearch || selectedArea !== "all" || selectedCategory !== "all";

  return (
    <div className="flex flex-col bg-background rounded-xl h-full">
      <TemplateTableFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        areas={areas}
        categories={categories}
        selectedItems={selectedItems.length}
        totalItems={filteredItems.length}
      />

      <div className="flex-1 min-h-0 overflow-auto rounded-lg border mt-3">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-12">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    className={cn(
                      "text-left bg-background",
                      header.column.id === "select" && "pr-0 w-0",
                      header.column.id === "name" && "pl-4"
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon column={header.column} />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {areaOrder.length === 0 ? (
              <DataTableEmptyRow colSpan={templateTableColumns.length}>
                <EmptyState
                  className="bg-background"
                  title={
                    hasFilters
                      ? `No results found`
                      : "No template items available"
                  }
                  subtitle={
                    hasFilters
                      ? "Try adjusting your search or filters"
                      : "Template inventory items will appear here once they're added."
                  }
                />
              </DataTableEmptyRow>
            ) : (
              areaOrder.map((area) => {
                const areaItems = sortedGroupedItems[area];
                const isExpanded = expandedAreas.has(area);
                const selectedCount = getSelectedCountForArea(area);

                return (
                  <Fragment key={`area-group-${area}`}>
                    <TableRow
                      className="bg-accent h-12 cursor-pointer hover:bg-accent/80 transition-colors"
                      onClick={() => toggleArea(area)}
                    >
                      <TableCell
                        colSpan={templateTableColumns.length}
                        className="py-0 pl-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium pl-3">
                              {areaLabels[area] || area}
                              <span className="ml-2 h-6 text-xs font-medium border border-border py-1 px-2.5 rounded-[6px] bg-background">
                                {areaItems.length} items
                              </span>
                            </span>
                          </div>

                          {selectedCount > 0 && (
                            <span className="text-muted-foreground text-sm mr-3">
                              {selectedCount} selected
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded &&
                      areaItems.map((item) => {
                        const row = table
                          .getRowModel()
                          .rows.find((r) => r.original.id === item.id);
                        if (!row) return null;

                        return (
                          <TemplateTableRow
                            key={item.id}
                            item={item}
                            row={row}
                            onToggle={() => row.toggleSelected(!row.getIsSelected())}
                          />
                        );
                      })}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-2">
        <TemplateModal
          propertyId={propertyId}
          unitId={unitId}
          collectionId={collectionId}
          collectionName={collectionName}
          selectedItems={selectedItems}
          onClose={onClose}
          onItemsAdded={() => {
            setRowSelection({});
            onItemsAdded?.();
          }}
        />
      </div>
    </div>
  );
}
