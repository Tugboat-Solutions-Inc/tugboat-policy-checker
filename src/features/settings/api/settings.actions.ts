"use server";

import { createClient } from "@/utils/supabase/server";
import { changePasswordSchema } from "../schemas/settings";
import { ROUTES } from "@/config/routes";
import { redirect } from "next/navigation";

export async function verifyCurrentPassword(currentPassword: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (error) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    return {
      success: true,
      message: "Password verified",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to verify password",
    };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  const result = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const supabase = await createClient();

  const verifyResult = await verifyCurrentPassword(result.data.currentPassword);

  if (!verifyResult.success) {
    return {
      success: false,
      message: verifyResult.message,
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: result.data.newPassword,
  });

  if (updateError) {
    return {
      success: false,
      message: updateError.message,
    };
  }

  return {
    success: true,
    message: "Password changed successfully",
  };
}

export async function signOutAndRedirect() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.AUTH.LOGIN);
}
