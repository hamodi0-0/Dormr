import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { MyListingsClient } from "@/components/lister/my-listings-client";
import type { Listing } from "@/lib/types/listing";

/**
 * Initial page load data → Server Component.
 * Subsequent mutations (create/edit/delete) update via React Query.
 * Excludes archived listings (soft-deleted).
 */
export default async function MyListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: listings } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_images (
        id,
        listing_id,
        storage_path,
        public_url,
        position,
        is_cover,
        created_at
      )
    `,
    )
    .eq("lister_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return (
    <>
      <ListerDashboardHeader title="My Listings" />
      <MyListingsClient initialListings={(listings ?? []) as Listing[]} />
    </>
  );
}
