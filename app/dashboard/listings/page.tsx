import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListingsBrowseClient } from "@/components/listings/listings-browse-client";
import type { Listing } from "@/lib/types/listing";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function BrowseListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const userType = user.user_metadata?.user_type;
  if (userType !== "student") redirect("/lister/dashboard");

  // Initial page load → Server Component (per data-fetching diagram)
  const { data: listings } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    // Outer wrapper: flex col, full height — lets sticky child work correctly
    <div className="flex flex-col flex-1 min-h-0">
      {/* Dashboard header stays sticky at top (z-30) */}
      <DashboardHeader title="Browse Listings" />
      {/* Browse client contains its own sticky filter bar (top-16, z-20) */}
      <ListingsBrowseClient initialListings={(listings as Listing[]) ?? []} />
    </div>
  );
}
