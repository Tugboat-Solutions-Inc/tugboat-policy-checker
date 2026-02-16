import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DecodedJWT } from "@/features/auth/types/auth-store.types";

interface AuthState {
  decodedToken: DecodedJWT | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setDecodedToken: (token: DecodedJWT) => void;
  clearAuth: () => void;
  getCurrentOrg: () => DecodedJWT["orgs"][0] | null;
  setHydrated: () => void;
  updateOrgName: (orgId: string, newName: string) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  decodedToken: null,
  isAuthenticated: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setDecodedToken: (token) =>
        set({
          decodedToken: token,
          isAuthenticated: true,
          isHydrated: true,
        }),

      clearAuth: () => set({ ...initialState, isHydrated: true }),

      setHydrated: () => set({ isHydrated: true }),

      getCurrentOrg: () => {
        const state = get();
        if (!state.decodedToken?.orgs || state.decodedToken.orgs.length === 0) {
          return null;
        }
        return (
          state.decodedToken.orgs.find((org) => org.owner) ??
          state.decodedToken.orgs[0]
        );
      },

      updateOrgName: (orgId: string, newName: string) => {
        const state = get();
        if (!state.decodedToken?.orgs) return;

        const updatedOrgs = state.decodedToken.orgs.map((org) =>
          org.org_id === orgId ? { ...org, org_name: newName } : org
        );

        set({
          decodedToken: {
            ...state.decodedToken,
            orgs: updatedOrgs,
          },
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
