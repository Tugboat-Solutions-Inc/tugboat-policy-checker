"use server";

import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import type {
  PaginatedAdminUsers,
  AdminUserSearchParams,
} from "../types/admin-user.types";

export async function getAdminUsers(
  params: AdminUserSearchParams = { page: 1, limit: 50, q: "" }
): Promise<ActionResult<PaginatedAdminUsers>> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params.q) {
    searchParams.append("q", params.q);
  }

  return fetchWithAuth<PaginatedAdminUsers>(
    `${API_ENDPOINTS.USERS.ADMIN_ALL}?${searchParams.toString()}`,
    {
      errorPrefix: "Failed to fetch admin users",
      cache: "no-store",
    }
  );
}
