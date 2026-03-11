import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const userType = requestUrl.searchParams.get("user_type"); // "lister" | null

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/error?message=Missing+auth+code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(
        "/auth/error?message=Unable+to+verify+session",
        requestUrl.origin,
      ),
    );
  }

  const user = data.user;

  // ── Lister Google OAuth flow ──────────────────────────────────────────────
  if (userType === "lister") {
    // Guard: don't let an existing student account become a lister
    if (user.user_metadata?.user_type === "student") {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL(
          "/auth/error?message=This+email+is+already+registered+as+a+student+account",
          requestUrl.origin,
        ),
      );
    }

    // Stamp user_type into auth metadata (idempotent)
    await supabase.auth.updateUser({
      data: { user_type: "lister" },
    });

    // Force session refresh so the redirect carries a JWT with the
    // updated user_type claim — without this the middleware would read
    // the stale token and sign the user out.
    await supabase.auth.refreshSession();

    // Upsert lister_profiles from Google-provided data
    const { error: profileError } = await supabase
      .from("lister_profiles")
      .upsert(
        {
          id: user.id,
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            "Lister",
          email: user.email ?? "",
          avatar_url: user.user_metadata?.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (profileError) {
      return NextResponse.redirect(
        new URL(
          "/auth/error?message=Failed+to+create+lister+profile",
          requestUrl.origin,
        ),
      );
    }

    return NextResponse.redirect(
      new URL("/lister/dashboard", requestUrl.origin),
    );
  }

  // ── Student email-confirmation flow ───────────────────────────────────────
  if (user.user_metadata?.user_type !== "student") {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/auth/error?message=Invalid+account+type", requestUrl.origin),
    );
  }

  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
