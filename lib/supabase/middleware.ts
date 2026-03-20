import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[proxy] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  try {
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    const pathname = request.nextUrl.pathname;

    // Define public paths that anyone can access
    const isPublicPath =
      pathname === "/" ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api");

    // If no user and trying to access protected routes, redirect to landing
    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // If user is logged in, handle routing based on user type
    if (user) {
      const userType = user.user_metadata?.user_type as string | undefined;

      // ============================================
      // STUDENT ROUTES
      // ============================================
      if (userType === "student") {
        // Check student profile completion
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("profile_completed")
          .eq("id", user.sub)
          .single();

        const isOnboarded = profile?.profile_completed || false;

        // If student tries to access lister routes, redirect to student dashboard
        if (pathname.startsWith("/lister")) {
          const url = request.nextUrl.clone();
          url.pathname = isOnboarded ? "/dashboard" : "/onboarding";
          return NextResponse.redirect(url);
        }

        // If not onboarded and trying to access dashboard, redirect to onboarding
        if (!isOnboarded && pathname.startsWith("/dashboard")) {
          const url = request.nextUrl.clone();
          url.pathname = "/onboarding";
          return NextResponse.redirect(url);
        }

        // If onboarded and trying to access onboarding, redirect to dashboard
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

      // ============================================
      // LISTER ROUTES (Future Implementation)
      // ============================================
      else if (userType === "lister") {
        // Check lister profile existence
        const { data: profile } = await supabase
          .from("lister_profiles")
          .select("id")
          .eq("id", user.sub)
          .single();

        const hasProfile = !!profile;

        // If lister tries to access student routes, redirect to lister dashboard
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/onboarding")
        ) {
          const url = request.nextUrl.clone();
          url.pathname = hasProfile
            ? "/lister/dashboard"
            : "/lister/onboarding";
          return NextResponse.redirect(url);
        }

        // If no profile and trying to access lister dashboard, redirect to lister onboarding
        if (!hasProfile && pathname.startsWith("/lister/dashboard")) {
          const url = request.nextUrl.clone();
          url.pathname = "/lister/onboarding";
          return NextResponse.redirect(url);
        }

        // If has profile and trying to access lister onboarding, redirect to lister dashboard
        if (hasProfile && pathname.startsWith("/lister/onboarding")) {
          const url = request.nextUrl.clone();
          url.pathname = "/lister/dashboard";
          return NextResponse.redirect(url);
        }

        // If lister opens landing page while logged in, route to app immediately
        if (pathname === "/") {
          const url = request.nextUrl.clone();
          url.pathname = hasProfile
            ? "/lister/dashboard"
            : "/lister/onboarding";
          return NextResponse.redirect(url);
        }
      }

      // ============================================
      // UNKNOWN USER TYPE (Shouldn't happen)
      // ============================================
      else {
        // If user has no user_type, sign them out and redirect to landing
        if (!isPublicPath) {
          await supabase.auth.signOut();
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[proxy] Failed while updating Supabase session", error);
    return supabaseResponse;
  }
}
