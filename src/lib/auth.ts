import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { USER_TYPES, type UserType } from "@/constants/user-types";
import { decodeAccessToken, type DecodedJWT } from "@/lib/jwt";
import { cache } from "react";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";

export type AccountType = UserType | null;
export type OrgRole = "ADMIN" | "MEMBER" | null;

const DEBUG_COOKIE_NAME = "debug_account_type";

async function getDebugAccountType(): Promise<AccountType | null> {
  if (process.env.NODE_ENV === "production") return null;

  const cookieStore = await cookies();
  const debugCookie = cookieStore.get(DEBUG_COOKIE_NAME);

  if (debugCookie?.value) {
    const value = debugCookie.value;
    if (
      value === USER_TYPES.COMPANY ||
      value === USER_TYPES.INDIVIDUAL ||
      value === USER_TYPES.MULTI_TENANT
    ) {
      return value as UserType;
    }
  }
  return null;
}

export async function getUserAccountType(): Promise<AccountType> {
  const debugOverride = await getDebugAccountType();
  if (debugOverride) return debugOverride;

  const decodedToken = await getDecodedJWT();
  if (decodedToken?.orgs?.[0]?.org_type) {
    return decodedToken.orgs[0].org_type as AccountType;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return getAccountTypeFromUser(user);
}

export function getAccountTypeFromUser(user: User | null): AccountType {
  if (!user) return null;

  const accountType = user.user_metadata?.account_type as AccountType;

  return accountType || USER_TYPES.INDIVIDUAL;
}

export async function getAccountTypeWithDebug(
  user: User | null
): Promise<AccountType> {
  const debugOverride = await getDebugAccountType();
  if (debugOverride) return debugOverride;

  return getAccountTypeFromUser(user);
}

export const getCachedSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const getDecodedJWT = cache(async (): Promise<DecodedJWT | null> => {
  const session = await getCachedSession();
  if (!session?.access_token) return null;
  return decodeAccessToken(session.access_token);
});

export const getUserOrgRole = cache(async (): Promise<OrgRole> => {
  const decodedToken = await getDecodedJWT();
  return decodedToken?.orgs?.[0]?.role ?? null;
});

export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const session = await getCachedSession();
  if (!session?.access_token) return null;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
  };

  const impersonatedUserId = await getImpersonatedUserId();
  if (impersonatedUserId) {
    headers["TB-IMA-Impersonated-User"] = impersonatedUserId;
  }

  return headers;
}
