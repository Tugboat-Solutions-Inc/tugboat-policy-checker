"use client";

import { createContext, useContext, ReactNode } from "react";
import { Capability } from "@/constants/permissions.constants";

interface PermissionsContextValue {
  capabilities: Capability[];
  can: (capability: Capability) => boolean;
  canAny: (...capabilities: Capability[]) => boolean;
  canAll: (...capabilities: Capability[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface PermissionsProviderProps {
  capabilities: Capability[];
  children: ReactNode;
}

export function PermissionsProvider({
  capabilities,
  children,
}: PermissionsProviderProps) {
  const can = (capability: Capability): boolean => {
    return capabilities.includes(capability);
  };

  const canAny = (...requiredCapabilities: Capability[]): boolean => {
    return requiredCapabilities.some((cap) => capabilities.includes(cap));
  };

  const canAll = (...requiredCapabilities: Capability[]): boolean => {
    return requiredCapabilities.every((cap) => capabilities.includes(cap));
  };

  const value: PermissionsContextValue = {
    capabilities,
    can,
    canAny,
    canAll,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error(
      "usePermissions must be used within a PermissionsProvider"
    );
  }
  return context;
}

