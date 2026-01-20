export type AdminUser = {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  settings: UserSettings | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  notifications: {
    sms: boolean;
    email: boolean;
    marketing: boolean;
  };
};

export type PaginatedAdminUsers = {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  data: AdminUser[];
};

export type AdminUserSearchParams = {
  page: number;
  limit: number;
  q?: string;
};
