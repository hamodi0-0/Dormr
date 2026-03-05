import { createClient } from "@/lib/supabase/server";
import { ListingsGridClient } from "@/components/listings/listings-browse-client";
import type { Listing } from "@/lib/types/listing";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";
import type { ListingsPageResult } from "@/hooks/use-public-listings-page";
import { PAGE_SIZE } from "@/hooks/use-public-listings-page";

export default async function BrowsePage() {
  const supabase = await createClient();

  // Page 1, no filters — matches what the client will hydrate from
  const { data: listingRows, count } = await supabase
    .from("listings")
    .select(
      `*, listing_images(id, listing_id, storage_path, public_url, position, is_cover, created_at)`,
      { count: "exact" },
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const listings = (listingRows ?? []) as Listing[];

  // Batch-fetch tenant profiles for multi-occupant listings
  const multiOccupantIds = listings
    .filter((l) => l.max_occupants > 1)
    .map((l) => l.id);

  const tenantProfiles: Record<string, TenantCompatibilityProfile[]> = {};

  if (multiOccupantIds.length > 0) {
    const { data: tenantRows } = await supabase
      .from("listing_tenants")
      .select("listing_id, user_id")
      .in("listing_id", multiOccupantIds);

    const rows = tenantRows ?? [];

    if (rows.length > 0) {
      const userIds = [...new Set(rows.map((r) => r.user_id))];

      const { data: profileRows } = await supabase
        .from("student_profiles")
        .select(
          "id, sleep_schedule, cleanliness, noise_level, guests_frequency, smoking, pets, major, hobbies",
        )
        .in("id", userIds);

      const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

      for (const row of rows) {
        const profile = profileMap.get(row.user_id);
        if (!profile) continue;
        if (!tenantProfiles[row.listing_id])
          tenantProfiles[row.listing_id] = [];
        tenantProfiles[row.listing_id].push(
          profile as unknown as TenantCompatibilityProfile,
        );
      }
    }
  }

  const initialData: ListingsPageResult = {
    listings,
    tenantProfiles,
    totalCount: count ?? 0,
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Find your next home</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse student-friendly listings near your university
        </p>
      </div>
      <ListingsGridClient initialData={initialData} />
    </main>
  );
}
