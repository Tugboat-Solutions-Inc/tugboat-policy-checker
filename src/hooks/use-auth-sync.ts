"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { decodeAccessToken, isTokenExpired } from "@/lib/jwt";
import { createClient } from "@/utils/supabase/client";

export function useAuthSync() {
  const { setDecodedToken, clearAuth, decodedToken, setHydrated } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const syncAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const decoded = decodeAccessToken(session.access_token);

        if (decoded) {
          if (isTokenExpired(decoded)) {
            clearAuth();
            await supabase.auth.signOut();
          } else {
            setDecodedToken(decoded);
          }
        } else {
          setHydrated();
        }
      } else {
        clearAuth();
      }
    };

    syncAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.access_token) {
          const decoded = decodeAccessToken(session.access_token);
          if (decoded) {
            setDecodedToken(decoded);
          }
        }
      } else if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setDecodedToken, clearAuth, setHydrated]);

  return decodedToken;
}

