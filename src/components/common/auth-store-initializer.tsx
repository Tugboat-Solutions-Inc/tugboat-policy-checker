"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { DecodedJWT } from "@/features/auth/types/auth-store.types";

interface AuthStoreInitializerProps {
  decodedToken: DecodedJWT | null;
}

export function AuthStoreInitializer({
  decodedToken,
}: AuthStoreInitializerProps) {
  const { setDecodedToken, clearAuth, isHydrated } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    if (decodedToken) {
      setDecodedToken(decodedToken);
      hasInitialized.current = true;
    } else {
      clearAuth();
      hasInitialized.current = true;
    }
  }, [decodedToken, setDecodedToken, clearAuth]);

  return null;
}
