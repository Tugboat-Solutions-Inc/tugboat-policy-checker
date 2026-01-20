"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export interface TemplateTableItem {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  area: string;
  areaName: string;
}

export const templateTableColumns: ColumnDef<TemplateTableItem>[] = [
  {
    id: "select",
    size: 0,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    size: 400,
    header: "Name",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">{row.getValue("name")}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "category",
    size: 300,
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-foreground">
        {row.getValue("category")}
      </span>
    ),
    enableSorting: true,
  },
];
