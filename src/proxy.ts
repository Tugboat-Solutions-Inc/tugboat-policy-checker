import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/utils/env";
import { ROUTES } from "@/config/routes";
import { decodeAccessToken, type DecodedJWT } from "@/lib/jwt";

const protectedRoutes = [ROUTES.DASHBOARD.ROOT, ROUTES.AUTH.ONBOARDING];
const authOnlyRoutes = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.WELCOME,
];
const publicRoutes = [
  ...authOnlyRoutes,
  ROUTES.AUTH.SIGNUP_SUCCESS,
  ROUTES.AUTH.SIGNUP_VERIFIED,
  ROUTES.AUTH.FORGOT_PASSWORD_SENT,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD_SUCCESS,
  "/auth/callback",
  "/invite",
];

function getOnboardingRoute(decodedToken: DecodedJWT | null): string {
  if (!decodedToken) {
    return ROUTES.AUTH.ONBOARDING;
  }

  const orgType = decodedToken.orgs?.[0]?.org_type;
  const orgRole = decodedToken.orgs?.[0]?.role;

  if (orgRole === "MEMBER") {
    return ROUTES.AUTH.ONBOARDING_MEMBER;
  }

  switch (orgType) {
    case "MULTI_TENANT":
      return ROUTES.AUTH.ONBOARDING_MULTI_TENANT;
    case "COMPANY":
      return ROUTES.AUTH.ONBOARDING_COMPANY;
    case "INDIVIDUAL":
    default:
      return ROUTES.AUTH.ONBOARDING;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    path.startsWith(route) && 
    !path.startsWith(ROUTES.AUTH.SIGNUP_VERIFIED) && 
    !path.startsWith(ROUTES.AUTH.SIGNUP_SUCCESS)
  );

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const decodedToken = session?.access_token
    ? decodeAccessToken(session.access_token)
    : null;

  // Force users with incomplete onboarding to the correct onboarding page
  // But allow them to see the verified page first
  // Admin users skip onboarding entirely
  const isOnboardingPath = path.startsWith(ROUTES.AUTH.ONBOARDING);
  const isVerifiedPath = path.startsWith(ROUTES.AUTH.SIGNUP_VERIFIED);
  const isAdmin = decodedToken?.role === "ADMIN";
  
  if (
    user &&
    decodedToken &&
    decodedToken.onboarding_complete === false &&
    !isOnboardingPath &&
    !isVerifiedPath &&
    !isAdmin
  ) {
    const correctOnboardingRoute = getOnboardingRoute(decodedToken);
    return NextResponse.redirect(
      new URL(correctOnboardingRoute, request.nextUrl)
    );
  }

  // Redirect users on the wrong onboarding page to the correct one
  if (
    user &&
    decodedToken &&
    decodedToken.onboarding_complete === false &&
    isOnboardingPath &&
    !isAdmin
  ) {
    const correctOnboardingRoute = getOnboardingRoute(decodedToken);
    if (path !== correctOnboardingRoute && !path.startsWith(correctOnboardingRoute)) {
      return NextResponse.redirect(
        new URL(correctOnboardingRoute, request.nextUrl)
      );
    }
  }

  // Prevent users who completed onboarding (or are admins) from accessing onboarding page
  if (
    user &&
    decodedToken &&
    (decodedToken.onboarding_complete === true || isAdmin) &&
    path.startsWith(ROUTES.AUTH.ONBOARDING)
  ) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.nextUrl));
  }

  // From here down, either:
  // - user is not logged in, OR
  // - user is logged in and onboarding_complete === true

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.nextUrl));
  }

  if (isAuthOnlyRoute && user) {
    return NextResponse.redirect(
      new URL(ROUTES.DASHBOARD.ROOT, request.nextUrl)
    );
  }

  if (!user && !isPublicRoute && path !== ROUTES.HOME) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.nextUrl));
  }

  if (path === ROUTES.HOME) {
    return NextResponse.redirect(
      new URL(
        user ? ROUTES.DASHBOARD.ROOT : ROUTES.AUTH.WELCOME,
        request.nextUrl
      )
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|scss|js|woff|woff2|eot|ttf|otf)$).*)",
  ],
};
