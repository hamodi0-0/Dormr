import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  MessageSquare,
  TrendingUp,
  Home,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import type { ListerProfile } from "@/hooks/use-lister-profile";

export default async function ListerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch profile and listing stats in parallel
  const [profileResult, listingsResult] = await Promise.all([
    supabase.from("lister_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("listings")
      .select("id, status, title, created_at")
      .eq("lister_id", user.id)
      .neq("status", "archived"),
  ]);

  const profile = profileResult.data as ListerProfile | null;
  if (!profile) redirect("/");

  const listings = listingsResult.data ?? [];
  const activeCount = listings.filter((l) => l.status === "active").length;
  const pausedCount = listings.filter((l) => l.status === "paused").length;
  const draftCount = listings.filter((l) => l.status === "draft").length;
  const firstName = profile.full_name.split(" ")[0];

  return (
    <>
      <ListerDashboardHeader title="Dashboard" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your listings and track your performance here
              </p>
            </div>
            <Button asChild className="gap-2 self-start">
              <Link href="/lister/listings/new">
                <Plus className="h-4 w-4" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            {
              icon: Home,
              label: "Total Listings",
              value: String(listings.length),
              sub: "excl. archived",
            },
            {
              icon: Eye,
              label: "Active",
              value: String(activeCount),
              sub: "visible to students",
            },
            {
              icon: Clock,
              label: "Paused",
              value: String(pausedCount),
              sub: "temporarily hidden",
            },
            {
              icon: FileEdit,
              label: "Drafts",
              value: String(draftCount),
              sub: "not yet published",
            },
          ].map((stat) => (
            <Card key={stat.label} className="py-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-serif font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics coming soon banner */}
        <Card className="mb-6 border-primary/20 bg-primary/5 py-0">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Analytics Dashboard
                </h2>
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                View listing views, student enquiry trends, and performance
                metrics. We&apos;re building this now.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick links grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* My Listings */}
          <Card className="py-0 group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <CardHeader className="pb-0 pt-5 px-5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                My Listings
              </CardTitle>
              <CardDescription className="text-xs">
                {activeCount > 0
                  ? `${activeCount} active listing${activeCount !== 1 ? "s" : ""} visible to students`
                  : "No active listings yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-5 px-5">
              <Button asChild size="sm" className="gap-2 h-8 text-xs">
                <Link href="/lister/listings">
                  View All Listings
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Chats — coming soon */}
          <Card className="py-0 opacity-70">
            <CardHeader className="pb-0 pt-5 px-5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Student Chats
                <Badge variant="secondary" className="text-xs ml-auto">
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time messaging with students interested in your listings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-5 px-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                We&apos;re building real-time chat now
              </div>
            </CardContent>
          </Card>

          {/* Analytics teaser */}
          <Card className="py-0 opacity-70">
            <CardHeader className="pb-0 pt-5 px-5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Performance Analytics
                <Badge variant="secondary" className="text-xs ml-auto">
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Views, saves, and enquiry rates per listing
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-5 px-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Data will appear here once analytics are live
              </div>
            </CardContent>
          </Card>

          {/* Compatibility insights */}
          <Card className="py-0 opacity-70">
            <CardHeader className="pb-0 pt-5 px-5">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Compatibility Insights
                <Badge variant="secondary" className="text-xs ml-auto">
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                See how well your listings match student profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-5 px-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Powered by our compatibility algorithm
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
