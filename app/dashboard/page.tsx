import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This shouldn't happen because middleware redirects, but just in case
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user has completed onboarding by seeing if profile exists with required fields
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_onboarded")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist or is missing required fields, show onboarding prompt
  if (!profile?.is_onboarded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Dorm Match!</CardTitle>
            <CardDescription>
              Complete your profile to start finding compatible roommates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              We need a bit more information to help you find the perfect
              roommate match. This will only take a few minutes!
            </p>
            <Link href="/onboarding">
              <Button className="w-full" size="lg">
                Start Profile Setup
              </Button>
            </Link>
            <div className="pt-4 border-t">
              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get initials for avatar fallback
  const initials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0].toUpperCase() ||
    "?";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Welcome back!</CardTitle>
                <CardDescription>
                  {user.user_metadata?.full_name ||
                    "You're successfully logged in"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">User ID:</span> {user.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Last sign in:</span>{" "}
                {new Date(user.last_sign_in_at!).toLocaleString()}
              </p>
              {user.user_metadata?.full_name && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span>{" "}
                  {user.user_metadata.full_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Complete your profile to start finding roommates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Create your profile</p>
                <p className="text-sm text-muted-foreground">
                  Add your preferences and lifestyle information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Browse listings
                </p>
                <p className="text-sm text-muted-foreground">
                  Find compatible roommates based on your preferences
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-semibold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Connect with matches
                </p>
                <p className="text-sm text-muted-foreground">
                  Message listers about available rooms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info Card (optional - remove in production) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                View raw user data
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
