import { getCachedSession } from "@/lib/auth";
import { getImpersonatedUserId } from "@/features/dashboard/utils/impersonation";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; status?: number };

type FetchWithAuthOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  cache?: RequestCache;
  errorPrefix?: string;
};

async function getSessionToken(): Promise<string | null> {
  const session = await getCachedSession();
  return session?.access_token ?? null;
}

async function getFreshSessionToken(): Promise<string | null> {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function executeRequest<T>(
  url: string,
  options: FetchWithAuthOptions,
  accessToken: string
): Promise<ActionResult<T>> {
  const { method = "GET", body, cache, errorPrefix = "Request failed" } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
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
    return { success: false, message: `${errorPrefix}: ${errorText}`, status: response.status };
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
}

export async function fetchWithAuth<T>(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<ActionResult<T>> {
  const accessToken = await getSessionToken();

  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const result = await executeRequest<T>(url, options, accessToken);

    // Retry GET requests once on transient failures with a fresh session
    const method = options.method ?? "GET";
    if (!result.success && method === "GET" && result.status !== 404) {
      console.warn(`[fetchWithAuth] ${method} ${url} failed (status: ${result.status}). Retrying with fresh session...`);
      await new Promise((r) => setTimeout(r, 300));
      const freshToken = await getFreshSessionToken();
      if (freshToken && freshToken !== accessToken) {
        return executeRequest<T>(url, options, freshToken);
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : (options.errorPrefix ?? "Request failed"),
    };
  }
}
