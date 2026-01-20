import { create } from "zustand";
import { Collection } from "@/features/collection-details/types/collection.types";

interface SelectedCollectionState {
  selectedCollection: Collection | null;
}

interface SelectedCollectionActions {
  setSelectedCollection: (collection: Collection) => void;
  clearSelectedCollection: () => void;
}

type SelectedCollectionStore = SelectedCollectionState &
  SelectedCollectionActions;

const initialState: SelectedCollectionState = {
  selectedCollection: null,
};

export const useSelectedCollectionStore = create<SelectedCollectionStore>()(
  (set) => ({
    ...initialState,

    setSelectedCollection: (collection) =>
      set({ selectedCollection: collection }),

    clearSelectedCollection: () => set({ selectedCollection: null }),
  })
);
