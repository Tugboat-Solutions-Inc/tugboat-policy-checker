import { create } from "zustand";

interface CollectionFavoritesState {
  favorites: Record<string, boolean>;
  pendingUpdates: Set<string>;
  setFavorite: (collectionId: string, isFavorite: boolean) => void;
  initializeFavorites: (collections: { id: string; favorite: boolean }[]) => void;
  clearPending: (collectionId: string) => void;
}

export const useCollectionFavoritesStore = create<CollectionFavoritesState>(
  (set) => ({
    favorites: {},
    pendingUpdates: new Set<string>(),
    setFavorite: (collectionId, isFavorite) =>
      set((state) => ({
        favorites: { ...state.favorites, [collectionId]: isFavorite },
        pendingUpdates: new Set(state.pendingUpdates).add(collectionId),
      })),
    initializeFavorites: (collections) =>
      set((state) => {
        const newFavorites = { ...state.favorites };
        collections.forEach((c) => {
          if (!state.pendingUpdates.has(c.id)) {
            newFavorites[c.id] = c.favorite;
          }
        });
        return { favorites: newFavorites };
      }),
    clearPending: (collectionId) =>
      set((state) => {
        const newPending = new Set(state.pendingUpdates);
        newPending.delete(collectionId);
        return { pendingUpdates: newPending };
      }),
  })
);
