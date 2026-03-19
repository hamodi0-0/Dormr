import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: use getUser() not getClaims() — getUser() validates and
  // refreshes the session server-side, which is required right after OAuth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user) {
    let userType = user.user_metadata?.user_type as string | undefined;

    // DB fallback when JWT claims are stale (right after OAuth)
    if (!userType && !isPublicPath) {
      const { data: listerProfile } = await supabase
        .from("lister_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (listerProfile) {
        userType = "lister";
      } else {
        const { data: studentProfile } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (studentProfile) {
          userType = "student";
        }
      }
    }

    // ── STUDENT ROUTES ────────────────────────────────────────────────────
    if (userType === "student") {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("profile_completed")
        .eq("id", user.id)
        .single();

      const isOnboarded = profile?.profile_completed ?? false;

      if (pathname.startsWith("/lister")) {
        const url = request.nextUrl.clone();
        url.pathname = isOnboarded ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(url);
      }

      if (!isOnboarded && pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (isOnboarded && pathname.startsWith("/onboarding")) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      // If student opens landing page while logged in, route to app immediately
      if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = isOnboarded ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(url);
      }
    }

    // ── LISTER ROUTES ─────────────────────────────────────────────────────
    else if (userType === "lister") {
      const { data: profile } = await supabase
        .from("lister_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      const hasProfile = !!profile;

      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/onboarding")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = hasProfile ? "/lister/dashboard" : "/lister/onboarding";
        return NextResponse.redirect(url);
      }

      if (!hasProfile && pathname.startsWith("/lister/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/lister/onboarding";
        return NextResponse.redirect(url);
      }

      if (hasProfile && pathname.startsWith("/lister/onboarding")) {
        const url = request.nextUrl.clone();
        url.pathname = "/lister/dashboard";
        return NextResponse.redirect(url);
      }

      // If lister opens landing page while logged in, route to app immediately
      if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = hasProfile ? "/lister/dashboard" : "/lister/onboarding";
        return NextResponse.redirect(url);
      }
    }

    // ── UNKNOWN USER TYPE ─────────────────────────────────────────────────
    else {
      if (!isPublicPath) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
