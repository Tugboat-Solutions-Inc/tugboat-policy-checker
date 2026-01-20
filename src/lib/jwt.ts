import { jwtDecode } from "jwt-decode";
import type { DecodedJWT } from "@/features/auth/types/auth-store.types";

export type { DecodedJWT };

export function decodeAccessToken(token: string): DecodedJWT | null {
  try {
    const decoded = jwtDecode<DecodedJWT>(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

export function isTokenExpired(token: DecodedJWT): boolean {
  if (!token.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return token.exp < currentTime;
}
