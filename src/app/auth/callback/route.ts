import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;

  console.log("=== AUTH CALLBACK HIT ===");
  console.log("Full URL:", request.url);
  console.log("Search params:", Object.fromEntries(searchParams.entries()));

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const adminInvite = searchParams.get("adminInvite") || searchParams.get("admin_invite");
  const retool = searchParams.get("retool");

  console.log("Auth callback params:", { code, token_hash, type, next });

  const supabase = await createClient();

  let isSignupFlow = false;
  let isRecoveryFlow = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.log("Auth callback error (code exchange):", error.message);
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    isSignupFlow = !next || retool === "true";
    console.log("Code exchange success. isSignupFlow:", isSignupFlow, "next:", next, "retool:", retool);
    isRecoveryFlow = next === ROUTES.AUTH.RESET_PASSWORD;
  } else if (token_hash) {
    const otpType = type || (next === ROUTES.AUTH.RESET_PASSWORD ? "recovery" : "email");
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType as "signup" | "recovery" | "email",
    });
    if (error) {
      console.error("Auth callback error (OTP verify):", error.message);
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    isSignupFlow = otpType === "signup" || otpType === "email";
    isRecoveryFlow = otpType === "recovery" || next === ROUTES.AUTH.RESET_PASSWORD;
  } else {
    return NextResponse.redirect(
      `${origin}${ROUTES.AUTH.LOGIN}?error=missing_auth_params`
    );
  }

  console.log(
    "Auth successful - isSignupFlow:",
    isSignupFlow,
    "isRecoveryFlow:",
    isRecoveryFlow
  );

  if (isRecoveryFlow || next === ROUTES.AUTH.RESET_PASSWORD) {
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.RESET_PASSWORD}`);
  }

  if (isSignupFlow) {
    const verifiedParams = new URLSearchParams();
    if (adminInvite) {
      verifiedParams.set("adminInvite", "true");
    }
    if (retool === "true") {
      verifiedParams.set("retool", "true");
    }
    
    const verifiedUrl = verifiedParams.toString()
      ? `${origin}${ROUTES.AUTH.SIGNUP_VERIFIED}?${verifiedParams.toString()}`
      : `${origin}${ROUTES.AUTH.SIGNUP_VERIFIED}`;
    return NextResponse.redirect(verifiedUrl);
  }

  return NextResponse.redirect(`${origin}${next || ROUTES.DASHBOARD.ROOT}`);
}
