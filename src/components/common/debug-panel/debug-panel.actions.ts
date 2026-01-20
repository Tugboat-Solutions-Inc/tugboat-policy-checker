"use server";

import { cookies } from "next/headers";
import { USER_TYPES, type UserType } from "@/constants/user-types";

const DEBUG_COOKIE_NAME = "debug_account_type";

export async function setDebugAccountType(type: UserType | null) {
  if (process.env.NODE_ENV === "production") {
    return { success: false, message: "Debug mode not available in production" };
  }

  const cookieStore = await cookies();

  if (type === null) {
    cookieStore.delete(DEBUG_COOKIE_NAME);
  } else {
    cookieStore.set(DEBUG_COOKIE_NAME, type, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
  }

  return { success: true };
}

export async function getDebugAccountType(): Promise<UserType | null> {
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
