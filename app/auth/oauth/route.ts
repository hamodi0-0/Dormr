import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Verify this is a student account
      if (data.user.user_metadata?.user_type === "student") {
        // Redirect to dashboard or next URL
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      } else {
        // Not a student, sign them out
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL(
            "/auth/error?message=Invalid account type",
            requestUrl.origin,
          ),
        );
      }
    }
  }

  // Error handling - redirect to error page
  return NextResponse.redirect(
    new URL("/auth/error?message=Unable to verify email", requestUrl.origin),
  );
}
