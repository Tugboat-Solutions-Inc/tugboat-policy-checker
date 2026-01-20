"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/common/data-table/data-table";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { propertyColumns } from "./properties-table-columns";
import { usePropertyModal } from "@/components/common/sidebar-property-dropdown/use-property-modal";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import type { TableProperty } from "../../types/company-dashboard.types";

const PAGE_SIZE = 10;

interface PropertiesTableProps {
  properties: TableProperty[];
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const debouncedSearch = useDebounce(searchValue, 300);

  const {
    isModalOpen,
    setIsModalOpen,
    steps,
    handleComplete,
    handleModalClose,
  } = usePropertyModal("COMPANY");

  const filteredProperties = React.useMemo(() => {
    if (!debouncedSearch) return properties;

    const searchLower = debouncedSearch.toLowerCase();
    return properties.filter(
      (property) =>
        property.propertyName.toLowerCase().includes(searchLower) ||
        property.propertyAddress.toLowerCase().includes(searchLower)
    );
  }, [properties, debouncedSearch]);

  const sortedProperties = React.useMemo(() => {
    if (sorting.length === 0) return filteredProperties;

    const [sort] = sorting;
    const { id, desc } = sort;

    return [...filteredProperties].sort((a, b) => {
      const aValue = a[id as keyof TableProperty];
      const bValue = b[id as keyof TableProperty];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return desc
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return desc ? bValue - aValue : aValue - bValue;
      }

      return 0;
    });
  }, [filteredProperties, sorting]);

  const paginatedProperties = React.useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE;
    return sortedProperties.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedProperties, currentPage]);

  const pageCount = Math.ceil(sortedProperties.length / PAGE_SIZE);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch]);

  const handlePageChange = (newPageIndex: number) => {
    setCurrentPage(newPageIndex);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setCurrentPage(0);
  };

  return (
    <>
      <TugboatMultiStepModal
        open={isModalOpen}
        onOpenChange={(open) => !open && handleModalClose()}
        maxWidth="lg"
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleModalClose}
        showStepIndicator={steps.length > 1}
      />
      <div className="h-full flex flex-col min-h-0">
        <DataTable
          columns={propertyColumns}
          data={paginatedProperties}
          title="Properties"
          search={{
            placeholder: "Search...",
            value: searchValue,
            onChange: setSearchValue,
          }}
          pagination={{
            pageSize: PAGE_SIZE,
            pageIndex: currentPage,
            pageCount: pageCount,
            totalCount: sortedProperties.length,
            onPageChange: handlePageChange,
          }}
          sorting={{
            state: sorting,
            onChange: handleSortingChange,
            manual: false,
          }}
          headerActions={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          }
          emptyState={{
            title: "No properties found",
            subtitle:
              properties.length === 0
                ? "Add your first property to start managing your portfolio."
                : "Try adjusting your search to see more results.",
          }}
          className="flex-1 min-h-0"
        />
      </div>
    </>
  );
}
