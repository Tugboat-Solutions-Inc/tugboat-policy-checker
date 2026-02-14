import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";
import { decodeAccessToken } from "@/lib/jwt";
import { env } from "@/utils/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;

  const code = searchParams.get("code");
  const token_hash =
    searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  const pendingCookies: {
    name: string;
    value: string;
    options: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.length = 0;
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.push({ name, value, options: options ?? {} });
          });
        },
      },
    }
  );

  let isRecoveryFlow = false;
  let session = null;

  if (code) {
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    session = data.session;
    isRecoveryFlow = next === ROUTES.AUTH.RESET_PASSWORD;
  } else if (token_hash) {
    const otpType =
      type ||
      (next === ROUTES.AUTH.RESET_PASSWORD ? "recovery" : "email");
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType as "signup" | "recovery" | "email",
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}${ROUTES.AUTH.LOGIN}?error=auth_callback_failed`
      );
    }
    session = data.session;
    isRecoveryFlow =
      otpType === "recovery" || next === ROUTES.AUTH.RESET_PASSWORD;
  } else {
    return NextResponse.redirect(
      `${origin}${ROUTES.AUTH.LOGIN}?error=missing_auth_params`
    );
  }

  let redirectUrl: string;

  if (isRecoveryFlow || next === ROUTES.AUTH.RESET_PASSWORD) {
    redirectUrl = `${origin}${ROUTES.AUTH.RESET_PASSWORD}`;
  } else {
    const decodedToken = session?.access_token
      ? decodeAccessToken(session.access_token)
      : null;

    if (!decodedToken?.onboarding_complete) {
      redirectUrl = `${origin}${ROUTES.AUTH.SIGNUP_VERIFIED}`;
    } else {
      redirectUrl = `${origin}${next || ROUTES.DASHBOARD.ROOT}`;
    }
  }

  const response = NextResponse.redirect(redirectUrl);

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as any);
  });

  return response;
}
