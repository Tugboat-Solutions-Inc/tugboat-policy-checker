import { Column } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortIconProps<TData> {
  column: Column<TData, unknown>;
}

export function SortIcon<TData>({ column }: SortIconProps<TData>) {
  const sortDirection = column.getIsSorted();

  if (sortDirection === "asc") {
    return <ArrowUp className="h-4 w-4 text-foreground" />;
  }
  if (sortDirection === "desc") {
    return <ArrowDown className="h-4 w-4 text-foreground" />;
  }
  return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
}
