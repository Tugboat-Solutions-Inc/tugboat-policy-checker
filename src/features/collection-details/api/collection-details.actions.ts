"use server";

import type {
  CollectionDetails,
  CollectionItem,
} from "../types/collection-details.types";

const COLLECTION_NAMES = [
  "Living Room",
  "Kitchen",
  "Master Bedroom",
  "Home Office",
  "Garage",
  "Outdoor Patio",
  "Basement",
  "Guest Room",
  "Bathroom",
  "Dining Room",
];

const COLLECTION_IMAGES = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
];

const DESCRIPTIONS = [
  "Catalog of living room furniture, electronics, and decor for insurance and inventory. Includes sofa, TV, sound system, coffee table, lamps, and art pieces.",
  "Complete kitchen inventory including appliances, cookware, and dining essentials. Perfect for home insurance documentation.",
  "Master bedroom collection featuring bed, dressers, nightstands, and personal electronics. Documented for insurance purposes.",
  "Home office setup with desk, chair, computer equipment, and accessories. Full documentation for work-from-home setup.",
  "Garage inventory including tools, equipment, and storage items. Comprehensive list for insurance and organization.",
];

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100;
}

export async function fetchCollectionById(
  collectionId: string
): Promise<CollectionDetails | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const seed = seededRandom(collectionId);
  const nameIndex = Math.floor(seed * COLLECTION_NAMES.length);
  const imageIndex = Math.floor(seed * COLLECTION_IMAGES.length);
  const descIndex = Math.floor(seed * DESCRIPTIONS.length);

  const uploads = Math.floor(seed * 50) + 10;
  const totalItems = Math.floor(seed * 80) + 20;
  const totalValue = Math.floor(seed * 50000) + 5000;

  return {
    id: collectionId,
    name: COLLECTION_NAMES[nameIndex],
    description: DESCRIPTIONS[descIndex],
    coverImage: COLLECTION_IMAGES[imageIndex],
    isFavorite: seed > 0.5,
    hasWalkthroughVideos: seed > 0.3,
    stats: {
      uploads,
      totalItems,
      totalValue,
    },
    createdAt: new Date(
      Date.now() - Math.floor(seed * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const ITEM_DATA = {
  names: [
    "Air Purifier",
    "Area Rug",
    "Artwork - Abstract Print",
    "Basket Storage",
    "Blanket Ladder",
    'Samsung 65" OLED TV',
    "Leather Sectional Sofa",
    "Coffee Table",
    "Standing Lamp",
    "Bose Soundbar",
  ],
  descriptions: [
    "HEPA air purification system",
    "9x12 Persian style rug",
    "Large framed abstract painting",
    "Woven storage baskets",
    "Wooden blanket display ladder",
    "Premium OLED display with smart features",
    "Italian leather sectional",
    "Solid oak coffee table",
    "Adjustable floor lamp",
    "Wireless surround sound",
  ],
  brands: [
    "Dyson",
    "Rugs USA",
    "Local Artist",
    "West Elm",
    "Samsung",
    "Bose",
    "IKEA",
    "Pottery Barn",
  ],
  models: [
    "DYS-PURE-COOL",
    "RUSA-PER-912",
    "LA-ABS-001",
    "WE-BASKET-WOV",
    "SAM-OLED-65",
    "BOSE-SB-700",
  ],
  categories: [
    "Appliances / Electronics",
    "Furniture",
    "Wall Art / Decor",
    "Storage",
    "Lighting",
  ],
};

export async function fetchCollectionItems(
  collectionId: string
): Promise<CollectionItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const seed = seededRandom(collectionId);
  const itemCount = Math.floor(seed * 30) + 20;
  const conditions: Array<"good" | "fair" | "new"> = ["good", "fair", "new"];
  const statuses: Array<"processing" | "completed"> = [
    "processing",
    "completed",
  ];

  return Array.from({ length: itemCount }, (_, i) => {
    const itemSeed = seededRandom(`${collectionId}-${i}`);
    const quantity = Math.floor(itemSeed * 5) + 1;
    const itemValue = Math.floor(itemSeed * 800) + 50;

    const brandIndex = Math.floor(itemSeed * ITEM_DATA.brands.length);
    const categoryIndex = Math.floor(itemSeed * ITEM_DATA.categories.length);

    return {
      id: `item-${collectionId}-${i}`,
      name: ITEM_DATA.names[i % ITEM_DATA.names.length],
      description: ITEM_DATA.descriptions[i % ITEM_DATA.descriptions.length],
      imageUrl: `https://picsum.photos/seed/${collectionId}-${i}/100/100`,
      brand: ITEM_DATA.brands[brandIndex],
      brandId: `brand-${brandIndex}`,
      model: ITEM_DATA.models[Math.floor(itemSeed * ITEM_DATA.models.length)],
      category: ITEM_DATA.categories[categoryIndex],
      categoryId: `category-${categoryIndex}`,
      condition: conditions[Math.floor(itemSeed * 3)],
      age: Math.floor(itemSeed * 10) + 1,
      quantity,
      itemValue,
      totalValue: itemValue * quantity,
      status: i === 0 ? "processing" : statuses[Math.floor(itemSeed * 2)],
      processingProgress: i === 0 ? Math.floor(itemSeed * 100) : undefined,
      boundingBoxes: null,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export async function updateCollectionItem(
  itemId: string,
  updates: Partial<CollectionItem>
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100));


  return { success: true };
}

export { getVideos, deleteVideo, initVideoUpload } from "./video.actions";
