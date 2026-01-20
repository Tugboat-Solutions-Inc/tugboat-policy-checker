import { useState } from "react";
import { SortingState } from "@tanstack/react-table";

interface UseControlledStateProps<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export function useControlledState<T>({
  value,
  defaultValue,
  onChange,
}: UseControlledStateProps<T>): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (newValue: T) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return [currentValue, setValue];
}

export function useTableSorting(
  externalSorting?: SortingState,
  onSortingChange?: (sorting: SortingState) => void
) {
  return useControlledState({
    value: externalSorting,
    defaultValue: [],
    onChange: onSortingChange,
  });
}

export function useTablePagination(
  externalPageIndex?: number,
  onPageChange?: (pageIndex: number) => void
) {
  return useControlledState({
    value: externalPageIndex,
    defaultValue: 0,
    onChange: onPageChange,
  });
}
