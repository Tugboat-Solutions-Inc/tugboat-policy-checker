import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useImpersonationStore } from "@/stores/impersonation-store";
import { useSelectedPropertyStore } from "@/stores/selected-property-store";
import { useSelectedCollectionStore } from "@/stores/selected-collection-store";
import { usePropertyFormStore } from "@/stores/property-form-store";
import { logout as serverLogout } from "@/features/auth/api/auth.actions";

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearImpersonation = useImpersonationStore((state) => state.clearImpersonation);
  const clearSelectedProperty = useSelectedPropertyStore((state) => state.clearSelectedProperty);
  const clearSelectedCollection = useSelectedCollectionStore((state) => state.clearSelectedCollection);
  const resetPropertyForm = usePropertyFormStore((state) => state.reset);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("impersonation-storage");
      localStorage.removeItem("selected-property-storage");
    }

    await serverLogout();

    clearAuth();
    clearImpersonation();
    clearSelectedProperty();
    clearSelectedCollection();
    resetPropertyForm();
  }, [clearAuth, clearImpersonation, clearSelectedProperty, clearSelectedCollection, resetPropertyForm]);

  return logout;
}
