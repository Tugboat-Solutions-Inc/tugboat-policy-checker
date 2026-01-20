export type Category = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
};

export type GetCategoriesResponse = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: Category[];
};