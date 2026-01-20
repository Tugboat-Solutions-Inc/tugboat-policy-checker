import { create } from "zustand";

export interface ImpersonatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
}

interface ImpersonationState {
  impersonatedUserId: string | null;
  impersonatedUser: ImpersonatedUser | null;
  isLoading: boolean;
}

interface ImpersonationActions {
  setImpersonatedUser: (userId: string, user: ImpersonatedUser) => void;
  updateImpersonatedUserFields: (fields: Partial<Omit<ImpersonatedUser, "id">>) => void;
  clearImpersonation: () => void;
  setLoading: (loading: boolean) => void;
}

type ImpersonationStore = ImpersonationState & ImpersonationActions;

const initialState: ImpersonationState = {
  impersonatedUserId: null,
  impersonatedUser: null,
  isLoading: false,
};

export const useImpersonationStore = create<ImpersonationStore>()((set, get) => ({
  ...initialState,

  setImpersonatedUser: (userId, user) =>
    set({
      impersonatedUserId: userId,
      impersonatedUser: user,
      isLoading: false,
    }),

  updateImpersonatedUserFields: (fields) => {
    const state = get();
    if (state.impersonatedUser) {
      set({
        impersonatedUser: {
          ...state.impersonatedUser,
          ...fields,
        },
      });
    }
  },

  clearImpersonation: () => set(initialState),

  setLoading: (loading) => set({ isLoading: loading }),
}));
