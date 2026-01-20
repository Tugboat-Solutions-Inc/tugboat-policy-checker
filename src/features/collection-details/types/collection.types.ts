import { Item } from "./item.types";
import { Upload } from "./upload.types";

export type CreateCollectionData = {
  name: string;
  description?: string;
  cover_image_b64?: string;
  cover_removed?: boolean;
  favorite?: boolean;
};

export type DuplicationGroup = {
  id: string;
  created_at: string;
  updated_at: string;
  items: Item[];
};

export type Collection = {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  items: Item[] | null;
  uploads: Upload[] | null;
  duplicates_detected: boolean;
  total_items: number;
  total_value: number;
  total_uploads?: number;
  favorite: boolean;
  dupe_groups: DuplicationGroup[] | null;
};

export type GetCollectionsResponse = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: Collection[];
};
