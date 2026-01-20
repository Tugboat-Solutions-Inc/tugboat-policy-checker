"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from "../schemas/auth";
import { ROUTES, EMAIL_REDIRECT_URLS } from "@/config/routes";


export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.DASHBOARD.ROOT);
}

export async function signup(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Validation failed",
    };
  }

  const inviteToken = formData.get("invite_token") as string | null;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: EMAIL_REDIRECT_URLS.SIGNUP_VERIFIED(
        env.NEXT_PUBLIC_BASE_URL
      ),
      data: inviteToken ? { invite_token: inviteToken } : undefined,
    },
  });

  // For security reasons, we don't reveal if the email already exists
  // Always show success page and let user check their email
  // Supabase handles sending appropriate emails (verification for new users, nothing for existing users)
  
  const cookieStore = await cookies();
  cookieStore.set("verification_email", result.data.email, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/signup",
    maxAge: 60 * 10,
  });

  if (inviteToken) {
    cookieStore.set("invite_token", inviteToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }

  // If there's an error but it's about the user already existing,
  // still redirect to success page for security
  if (error && !error.message.includes("already registered")) {
    return {
      success: false,
      message: "Unable to create account. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.AUTH.SIGNUP_SUCCESS);
}

export async function resendVerificationEmail(prevState: any, email: string) {
  const result = forgotPasswordSchema.safeParse({ email });

  if (!result.success) {
    return {
      success: false,
      message: "Invalid email address",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: result.data.email,
    options: {
      emailRedirectTo: EMAIL_REDIRECT_URLS.SIGNUP_VERIFIED(
        env.NEXT_PUBLIC_BASE_URL
      ),
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Verification email sent",
  };
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const resend = formData.get("resend") === "true";

  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Invalid email address",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    result.data.email,
    {
      redirectTo: EMAIL_REDIRECT_URLS.RESET_PASSWORD(env.NEXT_PUBLIC_BASE_URL),
    }
  );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set("reset_email", result.data.email, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/forgot-password",
    maxAge: 60 * 10,
  });

  if (resend) {
    return {
      success: true,
      message: "Password reset email sent",
    };
  }

  redirect(ROUTES.AUTH.FORGOT_PASSWORD_SENT);
}

export async function updatePassword(
  prevState: any,
  formData: FormData,
  tokenHash?: string | null
) {
  const result = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: "Password validation failed",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && tokenHash) {
    const { error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (sessionError) {
      return {
        success: false,
        message: "Invalid or expired reset link",
      };
    }
  } else if (!user && !tokenHash) {
    return {
      success: false,
      message: "Invalid or expired reset link. Please request a new one.",
    };
  }

  const { error: resetPasswordError } = await supabase.auth.updateUser({
    password: result.data.password,
  });

  if (resetPasswordError) {
    return {
      success: false,
      message: resetPasswordError.message,
    };
  }

  await supabase.auth.signOut();

  return {
    success: true,
    message: "Password updated successfully",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.AUTH.LOGIN);
}

