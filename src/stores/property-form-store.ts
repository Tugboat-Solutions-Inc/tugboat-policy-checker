import { create } from "zustand";
import { PropertySetupFormValues } from "@/features/auth/components/onboarding/property-setup-form";

type Unit = { unit_name: string };
type ClientInvite = { email: string; permission: "view" | "edit" };

interface PropertyFormState {
  propertySetup: PropertySetupFormValues | null;
  units: Unit[];
  clientInvites: ClientInvite[];
}

interface PropertyFormActions {
  setPropertySetup: (data: PropertySetupFormValues) => void;
  setUnits: (units: Unit[]) => void;
  setClientInvites: (invites: ClientInvite[]) => void;
  reset: () => void;
  getCompleteData: () => {
    propertySetup: PropertySetupFormValues | null;
    units: Unit[];
    clientInvites: ClientInvite[];
  };
}

type PropertyFormStore = PropertyFormState & PropertyFormActions;

const initialState: PropertyFormState = {
  propertySetup: null,
  units: [],
  clientInvites: [],
};

export const usePropertyFormStore = create<PropertyFormStore>()((set, get) => ({
  ...initialState,

  setPropertySetup: (data) =>
    set({
      propertySetup: data,
    }),

  setUnits: (units) =>
    set({
      units,
    }),

  setClientInvites: (clientInvites) =>
    set({
      clientInvites,
    }),

  reset: () => set(initialState),

  getCompleteData: () => {
    const state = get();
    return {
      propertySetup: state.propertySetup,
      units: state.units,
      clientInvites: state.clientInvites,
    };
  },
}));
