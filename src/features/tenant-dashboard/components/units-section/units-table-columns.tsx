import { ColumnDef } from "@tanstack/react-table";
import { UnitNameCell } from "../unit-name-cell";

export type Unit = {
  id: string;
  propertyId: string;
  unitName: string;
  tenants: number;
};

export const unitColumns: ColumnDef<Unit>[] = [
  {
    accessorKey: "unitName",
    header: "Unit Name",
    enableSorting: true,
    cell: ({ row }) => <UnitNameCell unit={row.original} />,
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
    cell: ({ row }) => <UnitNameCell unit={row.original} showButton />,
  },
];
