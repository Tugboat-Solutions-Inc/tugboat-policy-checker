import { ReactNode } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableRowProps {
  children: ReactNode;
  isLoading?: boolean;
  index: number;
}

export function DataTableRow({ children, isLoading, index }: DataTableRowProps) {
  return (
    <TableRow
      className={cn(
        "transition-all duration-500 ease-out",
        isLoading && "opacity-30 scale-[0.98] pointer-events-none blur-[1px]"
      )}
      style={{
        transitionDelay: isLoading ? "0ms" : `${index * 30}ms`,
      }}
    >
      {children}
    </TableRow>
  );
}

interface DataTableEmptyRowProps {
  colSpan: number;
  children: ReactNode;
}

export function DataTableEmptyRow({ colSpan, children }: DataTableEmptyRowProps) {
  return (
    <TableRow className="h-full">
      <TableCell
        colSpan={colSpan}
        className="h-full p-0"
      >
        <div className="flex items-center justify-center min-h-[300px] h-full">
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
}

