import { ColumnDef } from "@tanstack/react-table";
import { PropertyNameCell } from "../property-name-cell";
import type { TableProperty } from "../../types/company-dashboard.types";

export const propertyColumns: ColumnDef<TableProperty>[] = [
  {
    accessorKey: "propertyName",
    header: "Property Name",
    enableSorting: true,
    cell: ({ row }) => <PropertyNameCell property={row.original} />,
  },
  {
    accessorKey: "propertyAddress",
    header: "Property Address",
    enableSorting: false,
  },
  {
    accessorKey: "clients",
    header: "Clients",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("clients")}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PropertyNameCell property={row.original} showButton />,
  },
];

