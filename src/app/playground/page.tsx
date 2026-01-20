import * as React from "react";
import { Suspense } from "react";
import { KpiCard } from "@/components/common/kpi-card/kpi-card";
import { KpiCardSkeleton } from "@/components/common/kpi-card/kpi-card-skeleton";
import EmptyState from "@/components/common/empty-state";
import { CollectionCard } from "@/components/common/collection-card/collection-card";
import { CollectionCardSkeleton } from "@/components/common/collection-card/collection-card-skeleton";
import { CollectionCardList } from "@/components/common/collection-card/collection-card-list";
import { CollectionListItem } from "@/components/common/collection-list-item/collection-list-item";
import { CollectionListItemSkeleton } from "@/components/common/collection-list-item/collection-list-item-skeleton";
import { TugboatModal } from "@/components/common/tugboat-modal/tugboat-modal";
import { TugboatModalFooter } from "@/components/common/tugboat-modal/tugboat-modal-footer";
import { TugboatMultiStepModal } from "@/components/common/tugboat-modal/tugboat-multi-step-modal";
import {
  UploadImage,
  type UploadedFile,
} from "@/components/common/upload-image/upload-image";
import { HomeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Plus, Package, ChevronRight, ChevronDown } from "lucide-react";
import { DataTable } from "@/components/common/data-table/data-table";
import { DataTableExample } from "@/components/common/data-table/data-table-example";
import { ColumnDef } from "@tanstack/react-table";

type Unit = {
  id: string;
  unitName: string;
  propertyAddress: string;
  tenants: number;
};

const unitNames = [
  "Suite 104",
  "Unit 7A",
  "Apartment 3B",
  "Condo 205",
  "Loft 12",
  "Studio A",
  "Unit 9C",
];
const addresses = [
  "195 Valleywood Road, Tyrone, GA 30290",
  "89 Bayfront Avenue, San Diego, CA 92101",
  "456 Oak Street, Portland, OR 97201",
  "123 Pine Avenue, Austin, TX 78701",
  "789 Maple Drive, Seattle, WA 98101",
];

async function fetchUnits(
  page: number,
  pageSize: number = 10,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<{ data: Unit[]; total: number }> {
  "use server";

  await new Promise((resolve) => setTimeout(resolve, 300));

  let allUnits: Unit[] = Array.from({ length: 40 }, (_, i) => ({
    id: `${i + 1}`,
    unitName: unitNames[i % unitNames.length],
    propertyAddress: addresses[i % addresses.length],
    tenants: (i * 3) % 7,
  }));

  if (sortBy && sortOrder) {
    allUnits.sort((a, b) => {
      const aValue = a[sortBy as keyof Unit];
      const bValue = b[sortBy as keyof Unit];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: allUnits.slice(startIndex, endIndex),
    total: allUnits.length,
  };
}

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const sortBy = params.sortBy;
  const sortOrder = params.sortOrder;

  const { data: units, total: totalUnits } = await fetchUnits(
    currentPage,
    10,
    sortBy,
    sortOrder
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Data Table - Server-Side with Search Params
          </h2>
          <DataTableExample
            initialData={units}
            totalCount={totalUnits}
            currentPage={currentPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </Suspense>
  );
}
