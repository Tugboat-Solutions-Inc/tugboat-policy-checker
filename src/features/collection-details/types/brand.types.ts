export type BrandUnit = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
};

export type BrandProperty = {
  id: string;
  name: string;
  address: string;
  address_place_id: string;
  created_at: string;
  updated_at: string;
};

export type Brand = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  unit: BrandUnit;
  property: BrandProperty;
};

export type GetBrandsResponse = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: Brand[];
};
