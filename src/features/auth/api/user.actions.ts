"use server";

import { revalidatePath } from "next/cache";
import { API_ENDPOINTS } from "@/config/api";
import { fetchWithAuth, type ActionResult } from "@/lib/fetch-with-auth";
import { getAuthHeaders } from "@/lib/auth";
import type { User, UpdateUserInput } from "../types/user.types";
import { convertImageToBase64 } from "@/lib/utils";

export type { ActionResult };

type UpdateUserWithB64Input = UpdateUserInput;

export async function getUser(): Promise<ActionResult<User>> {
  return fetchWithAuth<User>(API_ENDPOINTS.USERS.ME, {
    cache: "no-store",
    errorPrefix: "Failed to fetch user",
  });
}

export async function updateUser(
  user: UpdateUserInput | UpdateUserWithB64Input
): Promise<ActionResult<User>> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const processedUser: UpdateUserWithB64Input = await (async () => {
    const { profile_picture_b64, ...rest } = user;

    if (profile_picture_b64 === null) {
      return {
        ...rest,
        profile_picture_b64: null,
      };
    }

    if (!profile_picture_b64) {
      return rest;
    }

    const base64Data = await convertImageToBase64(profile_picture_b64);

    if (!base64Data) {
      return rest;
    }

    return {
      ...rest,
      profile_picture_b64: base64Data,
    };
  })();

  try {
    const response = await fetch(API_ENDPOINTS.USERS.ME, {
      method: "PUT",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedUser),
    });

    if (!response.ok) {
      let errorMessage = "Unknown error";

      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message ?? JSON.stringify(errorJson);
      } catch {
        errorMessage = await response.text().catch(() => response.statusText);
      }

      return {
        success: false,
        message: `Failed to update user: ${errorMessage}`,
      };
    }

    let data: User | null = null;

    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch {
      return {
        success: false,
        message: "Invalid JSON response from server",
      };
    }

    if (!data) {
      const getUserResult = await getUser();
      if (!getUserResult.success) {
        return {
          success: false,
          message: "User updated but failed to fetch updated user data",
        };
      }
      data = getUserResult.data;
    }

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}
