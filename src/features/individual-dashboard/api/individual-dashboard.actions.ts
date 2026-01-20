"use server";

import type {
  IndividualPropertyDetails,
  PropertyCollection,
  PropertyItem,
} from "../types/individual-dashboard.types";

const collectionNames = [
  "Jewelry",
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Office",
  "Garage",
  "Garden",
  "Dining Room",
  "Basement",
  "Attic",
  "Patio",
  "Wine Cellar",
  "Art Collection",
  "Electronics",
  "Wardrobe",
];

const collectionImages = [
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400",
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400",
  "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400",
];

export async function fetchIndividualPropertyById(
  propertyId: string
): Promise<IndividualPropertyDetails | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const propertyIndex = parseInt(propertyId) % 10;
  
  const propertyName = `Property ${propertyId}`;
  const propertyAddress = "123 Main Street, City, State 12345";

  const collectionsCount = 5 + (propertyIndex % 4);
  const collections: PropertyCollection[] = Array.from(
    { length: collectionsCount },
    (_, i) => {
      const itemCount = 8 + ((propertyIndex + i) % 20);
      const value = itemCount * (300 + ((propertyIndex + i) % 700));
      return {
        id: `${propertyId}-collection-${i + 1}`,
        title: collectionNames[i % collectionNames.length],
        image: collectionImages[i % collectionImages.length],
        itemCount,
        value,
        isFavorite: i < 2,
      };
    }
  );

  const items: PropertyItem[] = [];
  collections.forEach((collection) => {
    for (let i = 0; i < collection.itemCount; i++) {
      items.push({
        id: `${collection.id}-item-${i + 1}`,
        name: `Item ${i + 1}`,
        est_cost: 100 + ((propertyIndex + i) % 500),
        collectionId: collection.id,
      });
    }
  });

  const totalValue = items.reduce((sum, item) => sum + item.est_cost, 0);

  return {
    id: propertyId,
    name: propertyName,
    address: propertyAddress,
    collections,
    items,
    kpis: {
      totalItems: items.length,
      totalValue,
      averageValue:
        items.length > 0 ? Math.round(totalValue / items.length) : 0,
      collectionsCount: collections.length,
    },
  };
}

