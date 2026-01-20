import { ReactNode } from "react";
import { SortingState, RowSelectionState } from "@tanstack/react-table";

export interface DataTableSearchConfig {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export interface DataTablePaginationConfig {
  pageSize?: number;
  pageIndex?: number;
  pageCount?: number;
  totalCount?: number;
  onPageChange?: (pageIndex: number) => void;
}

export interface DataTableSortingConfig {
  state?: SortingState;
  onChange?: (state: SortingState) => void;
  manual?: boolean;
}

export interface DataTableRowSelectionConfig {
  state?: RowSelectionState;
  onChange?: (state: RowSelectionState) => void;
}

export interface DataTableEmptyState {
  title: string;
  subtitle: string;
  action?: ReactNode;
}
