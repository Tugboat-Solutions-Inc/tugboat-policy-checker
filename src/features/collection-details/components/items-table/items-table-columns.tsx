"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusChip } from "@/components/ui/status-chip";
import type { CollectionItem } from "../../types/collection-details.types";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableConditionCell,
  EditableCategoryCell,
  EditableBrandCell,
  NameCellWithIcon,
} from "./editable-cells";
import { env } from "@/lib/env";

function StatusCell({ item }: { item: CollectionItem }) {
  if (item.status === "processing") {
    return (
      <StatusChip variant="processing" progress={item.processingProgress ?? 0}>
        Processing
      </StatusChip>
    );
  }

  return (
    <StatusChip variant="success">
      Completed
    </StatusChip>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export const itemsTableColumns: ColumnDef<CollectionItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="rounded-[2px] border-foreground"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded-[2px] border-foreground"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    size: 80,
    minSize: 80,
    cell: ({ row, table }) => {
      const imageUrl = row.getValue("imageUrl") as string | null | undefined;
      const fullImageUrl = imageUrl
        ? env.NEXT_PUBLIC_STORAGE_URL + imageUrl
        : null;
      const itemName = row.getValue("name") as string;
      const boundingBoxes = row.original.boundingBoxes;

      const handleClick = () => {
        if (fullImageUrl) {
          table.options.meta?.onImageClick?.(
            fullImageUrl,
            itemName,
            boundingBoxes
          );
        }
      };

      return (
        <div
          className="relative h-[57px] w-[57px] rounded-md overflow-hidden -my-3 flex items-center justify-center bg-primary/5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleClick}
        >
          {imageUrl ? (
            <Image
              src={fullImageUrl!}
              alt={itemName}
              fill
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-primary" />
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 220,
    minSize: 200,
    cell: ({ getValue, row, column, table }) => (
      <NameCellWithIcon
        getValue={getValue}
        row={row}
        column={column}
        table={table}
        className="font-normal"
      />
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 300,
    minSize: 250,
    cell: ({ getValue, row, column, table }) => (
      <EditableTextCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
        truncate
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    size: 160,
    minSize: 140,
    cell: ({ getValue, row, column, table }) => (
      <EditableBrandCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    size: 160,
    minSize: 140,
    cell: ({ getValue, row, column, table }) => (
      <EditableTextCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 180,
    minSize: 150,
    cell: ({ getValue, row, column, table }) => (
      <EditableCategoryCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ getValue, row, column, table }) => (
      <EditableConditionCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ getValue, row, column, table }) => (
      <EditableNumberCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ getValue, row, column, table }) => (
      <EditableNumberCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
      />
    ),
  },
  {
    accessorKey: "itemValue",
    header: "Item Value",
    cell: ({ getValue, row, column, table }) => (
      <EditableNumberCell
        getValue={getValue}
        row={row}
        column={column}
        table={table}
        formatFn={formatCurrency}
      />
    ),
  },
  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => (
      <span className="text-xs font-medium">
        {formatCurrency(row.getValue("totalValue"))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 150,
    minSize: 120,
    cell: ({ row }) => <StatusCell item={row.original} />,
  },
];
