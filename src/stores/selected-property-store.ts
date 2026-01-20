import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PropertyMetadata {
  id: string;
  name: string;
  address: string;
}

interface SelectedPropertyState {
  selectedPropertyId: string | null;
  propertyMetadata: Record<string, PropertyMetadata>;
  isHydrated: boolean;
}

interface SelectedPropertyActions {
  setSelectedPropertyId: (propertyId: string) => void;
  updatePropertyMetadata: (propertyId: string, metadata: { name?: string; address?: string }) => void;
  clearSelectedProperty: () => void;
  setHydrated: () => void;
}

type SelectedPropertyStore = SelectedPropertyState & SelectedPropertyActions;

const initialState: SelectedPropertyState = {
  selectedPropertyId: null,
  propertyMetadata: {},
  isHydrated: false,
};

export const useSelectedPropertyStore = create<SelectedPropertyStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedPropertyId: (propertyId) =>
        set({
          selectedPropertyId: propertyId,
          isHydrated: true,
        }),

      updatePropertyMetadata: (propertyId, metadata) => {
        const state = get();
        const existing = state.propertyMetadata[propertyId];
        
        set({
          propertyMetadata: {
            ...state.propertyMetadata,
            [propertyId]: {
              id: propertyId,
              name: metadata.name ?? existing?.name ?? "",
              address: metadata.address ?? existing?.address ?? "",
            },
          },
        });
      },

      clearSelectedProperty: () => set({ ...initialState, isHydrated: true }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "selected-property-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

