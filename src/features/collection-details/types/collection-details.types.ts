export interface CollectionDetails {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  isFavorite: boolean;
  hasWalkthroughVideos: boolean;
  stats: CollectionStats;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionStats {
  uploads: number;
  totalItems: number;
  totalValue: number;
}

export type ItemCondition = "good" | "fair" | "new";
export type ItemStatus = "processing" | "completed";

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  brand: string;
  brandId: string | null;
  model: string;
  category: string;
  categoryId: string | null;
  condition: ItemCondition;
  age: number;
  quantity: number;
  itemValue: number;
  totalValue: number;
  status: ItemStatus;
  processingProgress?: number;
  boundingBoxes: number[] | null;
  createdAt: string;
}

export interface WalkthroughVideo {
  id: string;
  bunnyVideoId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  createdAt: string;
}
