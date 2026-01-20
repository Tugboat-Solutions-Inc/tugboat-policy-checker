"use client";

import { useEffect, useRef } from "react";
import { useImpersonationStore } from "@/stores/impersonation-store";
import type { User } from "@/features/auth/schemas/user.schemas";

interface ImpersonationStoreInitializerProps {
  impersonatedUserId: string | null;
  impersonatedUserData: User | null;
}

export function ImpersonationStoreInitializer({
  impersonatedUserId,
  impersonatedUserData,
}: ImpersonationStoreInitializerProps) {
  const setImpersonatedUser = useImpersonationStore((state) => state.setImpersonatedUser);
  const clearImpersonation = useImpersonationStore((state) => state.clearImpersonation);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    if (impersonatedUserId && impersonatedUserData) {
      setImpersonatedUser(impersonatedUserId, {
        id: impersonatedUserData.id,
        firstName: impersonatedUserData.first_name,
        lastName: impersonatedUserData.last_name,
        email: impersonatedUserData.email,
        profilePictureUrl: impersonatedUserData.profile_picture_url,
      });
      hasInitialized.current = true;
    } else {
      clearImpersonation();
      hasInitialized.current = true;
    }
  }, [impersonatedUserId, impersonatedUserData, setImpersonatedUser, clearImpersonation]);

  return null;
}
