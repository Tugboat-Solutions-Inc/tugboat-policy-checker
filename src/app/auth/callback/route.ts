import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";
import { decodeAccessToken } from "@/lib/jwt";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;



  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  console.log("Auth callback params:", { code, token_hash, type, next });

  const supabase = await createClient();

  let isRecoveryFlow = false;
  let session = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.log("Auth callback error (code exchange):", error.message);
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    session = data.session;
    isRecoveryFlow = next === ROUTES.AUTH.RESET_PASSWORD;
  } else if (token_hash) {
    const otpType = type || (next === ROUTES.AUTH.RESET_PASSWORD ? "recovery" : "email");
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType as "signup" | "recovery" | "email",
    });
    if (error) {
      console.error("Auth callback error (OTP verify):", error.message);
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    session = data.session;
    isRecoveryFlow = otpType === "recovery" || next === ROUTES.AUTH.RESET_PASSWORD;
  } else {
    return NextResponse.redirect(
      `${origin}${ROUTES.AUTH.LOGIN}?error=missing_auth_params`
    );
  }

  if (isRecoveryFlow || next === ROUTES.AUTH.RESET_PASSWORD) {
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.RESET_PASSWORD}`);
  }

  const decodedToken = session?.access_token 
    ? decodeAccessToken(session.access_token) 
    : null;

  console.log("=== CALLBACK DEBUG ===");
  console.log("session exists:", !!session);
  console.log("decodedToken:", !!decodedToken);
  console.log("onboarding_complete:", decodedToken?.onboarding_complete);

  if (!decodedToken?.onboarding_complete) {
    console.log("Redirecting to SIGNUP_VERIFIED");
    return NextResponse.redirect(`${origin}${ROUTES.AUTH.SIGNUP_VERIFIED}`);
  }

  return NextResponse.redirect(`${origin}${next || ROUTES.DASHBOARD.ROOT}`);
}
