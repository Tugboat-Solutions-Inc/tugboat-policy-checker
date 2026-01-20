export type ItemFilters = {
  brandIds: string[];
  categoryIds: string[];
  conditions: string[];
  minValue: number | null;
  maxValue: number | null;
};

export const DEFAULT_FILTERS: ItemFilters = {
  brandIds: [],
  categoryIds: [],
  conditions: [],
  minValue: null,
  maxValue: null,
};

export const CONDITION_OPTIONS = [
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "BRAND_NEW", label: "New" },
] as const;

export const VALUE_RANGE_OPTIONS = [
  { label: "Under $100", minValue: null, maxValue: 100 },
  { label: "$100 - $500", minValue: 100, maxValue: 500 },
  { label: "$500 - $1000", minValue: 500, maxValue: 1000 },
  { label: "Over $1000", minValue: 1000, maxValue: null },
] as const;

