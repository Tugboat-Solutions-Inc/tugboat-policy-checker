"use client";

import * as React from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { SortingState } from "@tanstack/react-table";

import { AddUnitDropdown } from "../add-unit/add-unit-dropdown";
import { AddUnitModal } from "../add-unit/add-unit-modal";
import { ImportUnitsModal } from "../import-units-modal/import-units-modal";
import type { AddUnitFormValues } from "../../schemas/add-unit.schema";
import { useDebounce } from "@/hooks/use-debounce";
import { Unit, unitColumns } from "./units-table-columns";
import { createUnit, importUnits } from "@/features/dashboard/api/unit.actions";
import { createPropertyAccess } from "@/features/property-details/api/property-access.actions";
import { useCurrentOrg } from "@/hooks/use-auth";
import { toast } from "@/components/common/toast/toast";

const PAGE_SIZE = 10;

interface UnitsTableProps {
  propertyId: string;
  units: Unit[];
}

export function UnitsTable({ propertyId, units }: UnitsTableProps) {
  const currentOrg = useCurrentOrg();
  const [searchValue, setSearchValue] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const debouncedSearch = useDebounce(searchValue, 300);

  const filteredUnits = React.useMemo(() => {
    if (!debouncedSearch) return units;

    const searchLower = debouncedSearch.toLowerCase();
    return units.filter((unit) =>
      unit.unitName.toLowerCase().includes(searchLower)
    );
  }, [units, debouncedSearch]);

  const sortedUnits = React.useMemo(() => {
    if (sorting.length === 0) return filteredUnits;

    const [sort] = sorting;
    const { id, desc } = sort;

    return [...filteredUnits].sort((a, b) => {
      const aValue = a[id as keyof Unit];
      const bValue = b[id as keyof Unit];

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
  }, [filteredUnits, sorting]);

  const paginatedUnits = React.useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE;
    return sortedUnits.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedUnits, currentPage]);

  const pageCount = Math.ceil(sortedUnits.length / PAGE_SIZE);

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

  const handleAddUnit = async (data: AddUnitFormValues) => {
    if (!currentOrg) {
      toast.error("Error", "Organization not found");
      return;
    }

    const loadingToast = toast.loading("Creating unit", "Please wait...");

    try {
      const result = await createUnit(propertyId, {
        name: data.unitName,
        organization_id: currentOrg.org_id,
      });

      if (!result.success) {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to create unit",
          result.message || "Please try again"
        );
        return;
      }

      const validInvites = data.tenantInvites.filter(
        (invite) => invite.email.trim() !== ""
      );

      if (validInvites.length > 0) {
        const accessResult = await createPropertyAccess(
          propertyId,
          result.data.id,
          validInvites.map((invite) => ({
            email: invite.email,
            access_type: invite.permission === "edit" ? "EDITOR" : "VIEWER",
            is_client: true,
          }))
        );

        if (!accessResult.success) {
          toast.dismiss(loadingToast);
          toast.error(
            "Unit created but failed to invite tenants",
            accessResult.message || "Please try again"
          );
          return;
        }
      }

      toast.dismiss(loadingToast);
      toast.success("Unit created", `${data.unitName} has been created`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create unit", "Please try again");
    }
  };

  const handleImportUnits = async (file: File) => {
    const loadingToast = toast.loading("Importing units", "Please wait...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await importUnits(propertyId, formData);

      if (!result.success) {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to import units",
          result.message || "Please try again"
        );
        return;
      }

      toast.dismiss(loadingToast);
      toast.success("Units imported successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to import units", "Please try again");
    }
  };

  return (
    <>
      <AddUnitModal
        open={isAddUnitModalOpen}
        onOpenChange={setIsAddUnitModalOpen}
        onSubmit={handleAddUnit}
      />
      <ImportUnitsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSubmit={handleImportUnits}
      />
      <div className="h-full flex flex-col min-h-0">
        <DataTable
          columns={unitColumns}
          data={paginatedUnits}
          title="Units"
          search={{
            placeholder: "Search...",
            value: searchValue,
            onChange: setSearchValue,
          }}
          pagination={{
            pageSize: PAGE_SIZE,
            pageIndex: currentPage,
            pageCount: pageCount,
            totalCount: sortedUnits.length,
            onPageChange: handlePageChange,
          }}
          sorting={{
            state: sorting,
            onChange: handleSortingChange,
            manual: false,
          }}
          headerActions={
            <AddUnitDropdown
              onAddManually={() => setIsAddUnitModalOpen(true)}
              onImportSpreadsheet={() => setIsImportModalOpen(true)}
            />
          }
          emptyState={{
            title: "No units found",
            subtitle:
              units.length === 0
                ? "Add your first unit to start organizing this property."
                : "Try adjusting your search to see more results.",
          }}
          className="flex-1 min-h-0"
        />
      </div>
    </>
  );
}
