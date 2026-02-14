"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
} from "nuqs";
import { getItems } from "../api/item.actions";
import type { Item } from "../types/item.types";
import type { CollectionItem } from "../types/collection-details.types";
import type { ItemFilters } from "../types/item-filters.types";
import { useDebounce } from "@/hooks/use-debounce";
import { ITEMS_CHANGED_EVENT } from "../components/duplicates-section";

type CachedPage = {
  items: CollectionItem[];
  totalPages: number;
  totalItems: number;
};

const MAX_CACHE_SIZE = 20;

function buildQueryParams(itemFilters: ItemFilters) {
  const hasValueRange =
    itemFilters.minValue !== null && itemFilters.maxValue !== null;
  return {
    brand: itemFilters.brandIds.length > 0 ? itemFilters.brandIds : undefined,
    category:
      itemFilters.categoryIds.length > 0 ? itemFilters.categoryIds : undefined,
    condition:
      itemFilters.conditions.length > 0 ? itemFilters.conditions : undefined,
    minValue: hasValueRange ? itemFilters.minValue! : undefined,
    maxValue: hasValueRange ? itemFilters.maxValue! : undefined,
  };
}

function mapConditionFromApi(
  apiCondition: string
): CollectionItem["condition"] {
  const conditionMap: Record<string, CollectionItem["condition"]> = {
    FAIR: "fair",
    GOOD: "good",
    BRAND_NEW: "new",
  };
  return conditionMap[apiCondition] ?? "good";
}

export function mapItemToCollectionItem(item: Item): CollectionItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: item.photo_url,
    brand: item.brand?.name ?? "",
    brandId: item.brand?.id ?? null,
    model: item.model_nr,
    category: item.category?.name ?? "",
    categoryId: item.category?.id ?? null,
    condition: mapConditionFromApi(item.item_condition),
    age: item.est_age,
    quantity: item.quantity,
    itemValue: item.est_cost,
    totalValue: item.est_cost * item.quantity,
    status: "completed",
    boundingBoxes: item.bounding_box,
    createdAt: item.created_at,
  };
}

type UseItemsPaginationParams = {
  propertyId: string;
  unitId: string;
  collectionId: string;
  initialItems: Item[];
  initialPagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
};

export function useItemsPagination({
  propertyId,
  unitId,
  collectionId,
  initialItems,
  initialPagination,
}: UseItemsPaginationParams) {
  const [items, setItems] = useState<CollectionItem[]>(() =>
    initialItems.map(mapItemToCollectionItem)
  );
  const [pageIndex, setPageIndex] = useState(initialPagination.currentPage - 1);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [totalItems, setTotalItems] = useState(initialPagination.totalItems);
  const [isLoading, setIsLoading] = useState(false);

  const [searchValue, setSearchValue] = useQueryState(
    "search",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: true, history: "replace" })
  );
  const [unitIdParam, setUnitIdParam] = useQueryState(
    "unitId",
    parseAsString.withOptions({ shallow: true, history: "replace" })
  );
  const [urlFilters, setUrlFilters] = useQueryStates(
    {
      brandIds: parseAsArrayOf(parseAsString).withDefault([]),
      categoryIds: parseAsArrayOf(parseAsString).withDefault([]),
      conditions: parseAsArrayOf(parseAsString).withDefault([]),
      minValue: parseAsInteger,
      maxValue: parseAsInteger,
    },
    { shallow: true, history: "replace" }
  );

  useEffect(() => {
    if (unitId && unitIdParam !== unitId) {
      setUnitIdParam(unitId);
    }
  }, [unitId, unitIdParam, setUnitIdParam]);

  const filters: ItemFilters = useMemo(
    () => ({
      brandIds: urlFilters.brandIds ?? [],
      categoryIds: urlFilters.categoryIds ?? [],
      conditions: urlFilters.conditions ?? [],
      minValue: urlFilters.minValue ?? null,
      maxValue: urlFilters.maxValue ?? null,
    }),
    [
      urlFilters.brandIds,
      urlFilters.categoryIds,
      urlFilters.conditions,
      urlFilters.minValue,
      urlFilters.maxValue,
    ]
  );

  const debouncedSearchValue = useDebounce(searchValue.trim(), 500);

  const pageSize = 100;
  const pageCacheRef = useRef<Map<string, CachedPage>>(new Map());
  const previousSearchRef = useRef<string | null>(null);
  const previousFiltersRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const getCacheKey = useCallback(
    (page: number, query: string, itemFilters: ItemFilters) =>
      `${page}-${query}-${JSON.stringify(itemFilters)}`,
    []
  );

  const addToCache = useCallback((key: string, value: CachedPage) => {
    if (pageCacheRef.current.size >= MAX_CACHE_SIZE) {
      const firstKey = pageCacheRef.current.keys().next().value;
      if (firstKey) pageCacheRef.current.delete(firstKey);
    }
    pageCacheRef.current.set(key, value);
  }, []);

  const prefetchPage = useCallback(
    async (
      page: number,
      query: string,
      itemFilters: ItemFilters,
      maxPages: number
    ) => {
      if (page < 0 || page >= maxPages) return;
      const cacheKey = getCacheKey(page, query, itemFilters);
      if (pageCacheRef.current.has(cacheKey)) return;

      const result = await getItems(propertyId, unitId, collectionId, {
        limit: pageSize,
        page: page + 1,
        q: query || undefined,
        ...buildQueryParams(itemFilters),
      });

      if (result.success) {
        addToCache(cacheKey, {
          items: result.data.data.map(mapItemToCollectionItem),
          totalPages: result.data.total_pages,
          totalItems: result.data.total_items,
        });
      }
    },
    [propertyId, unitId, collectionId, getCacheKey, addToCache]
  );

  const fetchItems = useCallback(
    async (
      page: number,
      query: string,
      itemFilters: ItemFilters,
      skipCache = false
    ) => {
      const cacheKey = getCacheKey(page, query, itemFilters);
      const cached = pageCacheRef.current.get(cacheKey);

      if (cached && !skipCache) {
        setItems(cached.items);
        setTotalPages(cached.totalPages);
        setTotalItems(cached.totalItems);
        prefetchPage(page + 1, query, itemFilters, cached.totalPages);
        return;
      }

      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      try {
        const params = {
          limit: pageSize,
          page: page + 1,
          q: query && query.trim() ? query.trim() : undefined,
          ...buildQueryParams(itemFilters),
        };

        const result = await getItems(propertyId, unitId, collectionId, params);

        if (currentRequestId !== requestIdRef.current) return;

        if (result.success) {
          const mappedItems = result.data.data.map(mapItemToCollectionItem);
          setItems(mappedItems);
          setTotalPages(result.data.total_pages);
          setTotalItems(result.data.total_items);

          addToCache(cacheKey, {
            items: mappedItems,
            totalPages: result.data.total_pages,
            totalItems: result.data.total_items,
          });

          prefetchPage(page + 1, query, itemFilters, result.data.total_pages);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [propertyId, unitId, collectionId, getCacheKey, prefetchPage, addToCache]
  );

  useEffect(() => {
    const currentFiltersKey = JSON.stringify(filters);
    const isInitialRender =
      previousSearchRef.current === null && previousFiltersRef.current === null;

    if (isInitialRender) {
      previousSearchRef.current = debouncedSearchValue;
      previousFiltersRef.current = currentFiltersKey;
      return;
    }

    const searchChanged = previousSearchRef.current !== debouncedSearchValue;
    const filtersChanged = previousFiltersRef.current !== currentFiltersKey;

    if (!searchChanged && !filtersChanged) return;

    previousSearchRef.current = debouncedSearchValue;
    previousFiltersRef.current = currentFiltersKey;
    pageCacheRef.current.clear();
    setPageIndex(0);
    fetchItems(0, debouncedSearchValue, filters);
  }, [debouncedSearchValue, filters, fetchItems]);

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      setPageIndex(newPageIndex);
      fetchItems(newPageIndex, debouncedSearchValue, filters);
    },
    [fetchItems, debouncedSearchValue, filters]
  );

  const refetch = useCallback(
    () => fetchItems(pageIndex, debouncedSearchValue, filters, true),
    [fetchItems, pageIndex, debouncedSearchValue, filters]
  );

  const clearCache = useCallback(() => {
    pageCacheRef.current.clear();
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: ItemFilters) => {
      setUrlFilters({
        brandIds: newFilters.brandIds.length > 0 ? newFilters.brandIds : null,
        categoryIds:
          newFilters.categoryIds.length > 0 ? newFilters.categoryIds : null,
        conditions:
          newFilters.conditions.length > 0 ? newFilters.conditions : null,
        minValue: newFilters.minValue ?? null,
        maxValue: newFilters.maxValue ?? null,
      });
    },
    [setUrlFilters]
  );

  useEffect(() => {
    const handleItemsChanged = () => {
      pageCacheRef.current.clear();
      setPageIndex(0);
      fetchItems(0, debouncedSearchValue, filters, true);
    };

    window.addEventListener(ITEMS_CHANGED_EVENT, handleItemsChanged);
    return () => {
      window.removeEventListener(ITEMS_CHANGED_EVENT, handleItemsChanged);
    };
  }, [fetchItems, debouncedSearchValue, filters]);

  return {
    items,
    setItems,
    isLoading,
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    filters,
    setFilters: handleFiltersChange,
    pagination: {
      pageIndex,
      pageSize,
      totalPages,
      totalItems,
      onPageChange: handlePageChange,
    },
    refetch,
    clearCache,
  };
}
