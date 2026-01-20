"use client";

import { useAuthSync } from "@/hooks/use-auth-sync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();

  return <>{children}</>;
}

