import { getCachedSession } from "@/lib/auth";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

type FetchWithAuthOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  cache?: RequestCache;
  errorPrefix?: string;
};

export async function fetchWithAuth<T>(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<ActionResult<T>> {
  const {
    method = "GET",
    body,
    cache,
    errorPrefix = "Request failed",
  } = options;

  const session = await getCachedSession();

  if (!session?.access_token) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const impersonatedUserId = await getImpersonatedUserId();
    if (impersonatedUserId) {
      headers["TB-IMA-Impersonated-User"] = impersonatedUserId;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(cache && { cache }),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      return { success: false, message: `${errorPrefix}: ${errorText}` };
    }

    if (response.status === 204) {
      return { success: true, data: null as T };
    }

    const text = await response.text();
    if (!text) {
      return { success: true, data: null as T };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : errorPrefix,
    };
  }
}
