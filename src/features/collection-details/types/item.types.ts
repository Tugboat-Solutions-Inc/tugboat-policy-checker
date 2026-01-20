import type { Brand } from "./brand.types";
import type { Category } from "./category.types";

export type ItemCondition = "FAIR" | "GOOD" | "BRAND_NEW" | "";

export const CONDITION_OPTIONS = [
  { value: "FAIR", label: "Fair" },
  { value: "GOOD", label: "Good" },
  { value: "BRAND_NEW", label: "Brand New" },
];

//TODO update to correct types later

export type Item = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  model_nr: string;
  item_condition: ItemCondition;
  est_cost: number;
  photo_context: string;
  bounding_box: number[] | null;
  photo_url: string;
  category: Category | null;
  brand: Brand | null;
  dupe_group_id: string | null;
  est_age: number;
  quantity: number;
  additional_photos: string[];
};

export type CreateItemInput = {
  name: string;
  category_id: string;
  item_condition: ItemCondition;
  description?: string;
  model_nr?: string;
  est_cost?: number;
  est_age?: number;
  quantity?: number;
  brand_id?: string;
  photo_b64?: string;
  photo_removed?: boolean;
};

export type UpdateItemInput = Partial<CreateItemInput>;

export type getItemsResponse = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: Item[];
};

export type ItemImage = {
  id: string;
  created_at: string;
  item_id: string;
  user_id: string;
  url: string;
};

export type AddItemImageInput = {
  photo_b64: string;
};