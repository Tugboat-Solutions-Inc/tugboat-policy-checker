import { Item } from "./item.types";

export type UploadStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type UploadCollectionData = {
  id: string;
  name: string;
};

export type Upload = {
  id: string;
  created_at: string;
  updated_at: string;
  upload_status: UploadStatus;
  photo_urls: string[];
  notes: string;
  items: Item[] | null;
  items_count: number;
  photo_count: number;
  collection_data?: UploadCollectionData | null;
};

export type GetUploadResponse = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: Upload[];
};

export type CreateUploadData = {
  notes: string;
  photos_b64: string[];
};
