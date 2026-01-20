"use server";

import { cookies } from "next/headers";

const IMPERSONATION_COOKIE_NAME = "tb_impersonated_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function setImpersonatedUserId(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getImpersonatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(IMPERSONATION_COOKIE_NAME);
  return cookie?.value || null;
}

export async function clearImpersonatedUserId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE_NAME);
}
