"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

type Unit = {
  id: string;
  unitName: string;
  propertyAddress: string;
  tenants: number;
};

interface DataTableExampleProps {
  initialData: Unit[];
  totalCount: number;
  currentPage: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function DataTableExample({
  initialData,
  totalCount,
  currentPage,
  sortBy,
  sortOrder,
}: DataTableExampleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [searchValue, setSearchValue] = React.useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy || !sortOrder) return [];
    return [{ id: sortBy, desc: sortOrder === "desc" }];
  }, [sortBy, sortOrder]);

  const unitColumns: ColumnDef<Unit>[] = [
    {
      accessorKey: "unitName",
      header: "Unit Name",
      enableSorting: true,
    },
    {
      accessorKey: "propertyAddress",
      header: "Property Address",
      enableSorting: false,
    },
    {
      accessorKey: "tenants",
      header: "Tenants",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-xs font-medium">{row.getValue("tenants")}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="h-9">
            Manage
          </Button>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPageIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPageIndex + 1));
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSortingChange = (newSorting: SortingState) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSorting.length > 0) {
      params.set("sortBy", newSorting[0].id);
      params.set("sortOrder", newSorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Handle search effect
  React.useEffect(() => {
    if (debouncedSearch) {
      console.log("Search:", debouncedSearch);
      // TODO: Implement server-side search via URL params
    }
  }, [debouncedSearch]);

  return (
    <DataTable
      columns={unitColumns}
      data={initialData}
      title="Units"
      search={{
        placeholder: "Search...",
        value: searchValue,
        onChange: setSearchValue,
      }}
      pagination={{
        pageSize: 10,
        pageIndex: currentPage - 1,
        pageCount: Math.ceil(totalCount / 10),
        totalCount: totalCount,
        onPageChange: handlePageChange,
      }}
      sorting={{
        state: sorting,
        onChange: handleSortingChange,
        manual: true,
      }}
      headerActions={
        <Button variant="default" size="sm" className="h-9 gap-2">
          Add Unit
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
      emptyState={{
        title: "No units found",
        subtitle: "Add your first unit to start organizing this property.",
      }}
      isLoading={isPending}
    />
  );
}
