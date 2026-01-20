export type PropertyCollection = {
  id: string;
  title: string;
  image: string;
  itemCount: number;
  value: number;
  isFavorite: boolean;
};

export type PropertyItem = {
  id: string;
  name: string;
  est_cost: number;
  collectionId: string;
};

export type PropertyKpiData = {
  totalItems: number;
  totalValue: number;
  averageValue: number;
  collectionsCount: number;
};

export type IndividualPropertyDetails = {
  id: string;
  name: string;
  address: string;
  collections: PropertyCollection[];
  items: PropertyItem[];
  kpis: PropertyKpiData;
};

