export type DummyUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture_url?: string;
  userType?: string;
};

export type Property = {
  property_name: string;
  property_address: string;
  property_id: string;
  ownership_type: string;
};

export type Collection = {
  id: string;
  image: string;
  title: string;
  itemCount: number;
  value: string;
  isFavorite: boolean;
};

