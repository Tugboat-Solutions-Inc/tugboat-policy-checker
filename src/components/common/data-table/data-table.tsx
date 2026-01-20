"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  HeaderGroup,
  Header,
  Row,
  Cell,
  Updater,
  TableMeta,
  RowData,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import EmptyState from "../empty-state";
import { Pagination } from "./data-table-pagination";
import { SortIcon } from "./data-table-sort-icon";
import { DataTableHeader } from "./data-table-header";
import { DataTableRow, DataTableEmptyRow } from "./data-table-row";
import { useTableSorting, useTablePagination } from "./use-table-state";
import {
  DataTableSearchConfig,
  DataTablePaginationConfig,
  DataTableSortingConfig,
  DataTableRowSelectionConfig,
  DataTableEmptyState,
} from "./data-table.types";

interface DataTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  search?: DataTableSearchConfig;
  pagination?: DataTablePaginationConfig;
  sorting?: DataTableSortingConfig;
  rowSelection?: DataTableRowSelectionConfig;
  headerActions?: React.ReactNode;
  emptyState?: DataTableEmptyState;
  isLoading?: boolean;
  className?: string;
  meta?: TableMeta<TData>;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData extends RowData, TValue>({
  columns,
  data,
  title,
  search,
  pagination,
  sorting,
  rowSelection,
  headerActions,
  emptyState,
  isLoading = false,
  className,
  meta,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sortingState, setSortingState] = useTableSorting(
    sorting?.state,
    sorting?.onChange
  );
  const [pageIndex, setPageIndex] = useTablePagination(
    pagination?.pageIndex,
    pagination?.onPageChange
  );
  const [rowSelectionState, setRowSelectionState] =
    React.useState<RowSelectionState>(rowSelection?.state ?? {});

  React.useEffect(() => {
    if (rowSelection?.state !== undefined) {
      setRowSelectionState(rowSelection.state);
    }
  }, [rowSelection?.state]);

  const handleRowSelectionChange = React.useCallback(
    (updater: Updater<RowSelectionState>) => {
      const newState =
        typeof updater === "function" ? updater(rowSelectionState) : updater;
      setRowSelectionState(newState);
      rowSelection?.onChange?.(newState);
    },
    [rowSelectionState, rowSelection]
  );

  const pageSize = pagination?.pageSize ?? 10;
  const totalCount = pagination?.totalCount ?? data.length;
  const pageCount = pagination?.pageCount ?? Math.ceil(totalCount / pageSize);
  const isManualPagination = !!pagination?.onPageChange;
  const isManualSorting = sorting?.manual ?? false;
  const isEditMode = (meta as { isEditMode?: boolean })?.isEditMode ?? false;

  const frozenOrderRef = React.useRef<string[] | null>(null);
  const prevEditModeRef = React.useRef(isEditMode);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: isManualSorting || isEditMode ? undefined : getSortedRowModel(),
    onSortingChange: (updater: Updater<typeof sortingState>) => {
      if (isEditMode) return;
      const newSorting =
        typeof updater === "function" ? updater(sortingState) : updater;
      setSortingState(newSorting);
    },
    onRowSelectionChange: handleRowSelectionChange,
    manualPagination: isManualPagination,
    manualSorting: isManualSorting,
    rowCount: isManualPagination ? totalCount : undefined,
    state: {
      sorting: sortingState,
      pagination: {
        pageIndex,
        pageSize,
      },
      rowSelection: rowSelectionState,
    },
    meta,
    getRowId,
  });

  if (isEditMode && !prevEditModeRef.current) {
    frozenOrderRef.current = table.getRowModel().rows.map((row) => row.id);
  } else if (!isEditMode && prevEditModeRef.current) {
    frozenOrderRef.current = null;
  }
  prevEditModeRef.current = isEditMode;

  const displayRows = React.useMemo(() => {
    const rows = table.getRowModel().rows;
    if (!isEditMode || !frozenOrderRef.current) return rows;

    const rowsById = new Map(rows.map((row) => [row.id, row]));
    return frozenOrderRef.current
      .map((id) => rowsById.get(id))
      .filter((row): row is Row<TData> => row !== undefined);
  }, [table.getRowModel().rows, isEditMode]);

  return (
    <div className={cn("flex flex-col gap-5 h-full", className)}>
      {(title || search || headerActions) && (
        <DataTableHeader
          title={title}
          totalCount={totalCount}
          searchPlaceholder={search?.placeholder}
          searchValue={search?.value ?? ""}
          onSearchChange={search?.onChange ?? (() => {})}
          headerActions={headerActions}
          showSearch={!!search}
        />
      )}

      <div className="rounded-md border border-border bg-background flex flex-col flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="relative flex-1 flex flex-col min-h-0">
          {isLoading && data.length === 0 && (
            <div
              className="absolute inset-0 bg-background/5 backdrop-blur-[0.5px] z-[9] pointer-events-none"
              style={{ animation: "soft-pulse 2s ease-in-out infinite" }}
            />
          )}
          <Table
            className={cn(
              "transition-transform duration-500 ease-out",
              isLoading && "scale-[0.995]"
            )}
          >
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table
                .getHeaderGroups()
                .map((headerGroup: HeaderGroup<TData>) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(
                      (header: Header<TData, unknown>) => (
                        <TableHead
                          key={header.id}
                          style={{
                            width: header.getSize(),
                            minWidth: header.column.columnDef.minSize,
                          }}
                          className={cn(
                            header.id === "actions" ? "w-auto text-right" : "",
                            "bg-background"
                          )}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn(
                                "flex items-center gap-2",
                                header.column.getCanSort() &&
                                  !isEditMode &&
                                  "cursor-pointer select-none",
                                header.id === "actions" && "justify-end"
                              )}
                              onClick={
                                isEditMode
                                  ? undefined
                                  : header.column.getToggleSortingHandler()
                              }
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <SortIcon column={header.column} />
                              )}
                            </div>
                          )}
                        </TableHead>
                      )
                    )}
                  </tr>
                ))}
            </TableHeader>
            <TableBody>
              {displayRows?.length ? (
                <>
                  {displayRows.map((row: Row<TData>, index: number) => (
                      <DataTableRow
                        key={row.id}
                        isLoading={isLoading}
                        index={index}
                      >
                        {row
                          .getVisibleCells()
                          .map((cell: Cell<TData, unknown>) => (
                            <TableCell 
                              key={cell.id}
                              style={{
                                width: cell.column.getSize(),
                                minWidth: cell.column.columnDef.minSize,
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                      </DataTableRow>
                    ))}
                </>
              ) : (
                <DataTableEmptyRow colSpan={columns.length}>
                  {emptyState ? (
                    <EmptyState
                      className="bg-background"
                      title={emptyState.title}
                      subtitle={emptyState.subtitle}
                    >
                      {emptyState.action}
                    </EmptyState>
                  ) : (
                    <div className="text-muted-foreground">No results.</div>
                  )}
                </DataTableEmptyRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {pagination && (
        <Pagination
          currentPage={pageIndex}
          totalPages={pageCount}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPageIndex}
        />
      )}
    </div>
  );
}
