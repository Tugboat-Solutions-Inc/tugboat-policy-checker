import { Collection } from "@/features/dashboard/types/dashboard.types";

export function sortByUser(
  properties2: any[],
  collections: any[],
  items: any[]
) {
  const targetOwnerId = "aaaa0000-0000-4000-8000-000000000001";

  const filteredProperties = properties2;

  const filteredPropertyIds = new Set(filteredProperties.map((p) => p.id));

  const filteredCollections = collections.filter((collection) =>
    filteredPropertyIds.has(collection.unit_id)
  );

  const filteredCollectionIds = new Set(filteredCollections.map((c) => c.id));

  const filteredItems = items.filter((item) =>
    filteredCollectionIds.has(item.collection_id)
  );

  return {
    properties2: filteredProperties,
    collections: filteredCollections,
    items: filteredItems,
  };
}

export function transformCollectionsForCardList(
  collections: Array<{
    id: string;
    name: string;
    cover_image_url: string;
  }>,
  items: Array<{
    collection_id: string;
    est_cost: number;
  }>
): Collection[] {
  return collections.map((collection) => {
    const collectionItems = items.filter(
      (item) => item.collection_id === collection.id
    );
    const itemCount = collectionItems.length;
    const totalValue = collectionItems.reduce(
      (sum: number, item: { est_cost: number }) => sum + item.est_cost,
      0
    );
    const value =
      totalValue >= 1000
        ? `$${(totalValue / 1000).toFixed(1)}k`
        : `$${totalValue.toLocaleString()}`;

    return {
      id: collection.id,
      image:
        collection.cover_image_url ||
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
      title: collection.name,
      itemCount,
      value,
      isFavorite: false,
    };
  });
}

export function getTransformedCollections(
  collections: Array<{
    id: string;
    name: string;
    cover_image_url: string;
  }>,
  items: Array<{
    collection_id: string;
    est_cost: number;
  }>
): Collection[] {
  const baseCollections = transformCollectionsForCardList(collections, items);
  const validImages = [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
  ];
  const testCollections = Array.from({ length: 15 }, (_, i) => ({
    id: `test-${i}`,
    image: validImages[i % validImages.length],
    title: `Test Collection ${i + 1}`,
    itemCount: ((i * 7) % 100) + 1,
    value: `$${(i * 13) % 50}k`,
    isFavorite: false,
  }));
  return [...baseCollections, ...testCollections];
}
