import { createClient } from "@/lib/supabase/server";
import { ListingsGridClient } from "@/components/listings/listings-browse-client";
import type { Listing } from "@/lib/types/listing";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";
import type { ListingsPageResult } from "@/hooks/use-public-listings-page";

const PAGE_SIZE = 10;

export default async function BrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  // Page 1, no filters — matches what the client will hydrate from
  const { data: listingRows, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const baseListings = (listingRows ?? []) as Listing[];
  const listingIds = baseListings.map((l) => l.id);

  const imagesByListingId = new Map<
    string,
    NonNullable<Listing["listing_images"]>
  >();

  if (listingIds.length > 0) {
    const { data: imageRows } = await supabase
      .from("listing_images")
      .select(
        "id, listing_id, storage_path, public_url, position, is_cover, created_at",
      )
      .in("listing_id", listingIds)
      .order("position", { ascending: true });

    for (const img of imageRows ?? []) {
      const bucket = imagesByListingId.get(img.listing_id) ?? [];
      bucket.push(img);
      imagesByListingId.set(img.listing_id, bucket);
    }
  }

  const listings = baseListings.map((listing) => ({
    ...listing,
    listing_images: imagesByListingId.get(listing.id) ?? [],
  }));

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

    const rows = (tenantRows ?? []).filter((r) => r.user_id !== viewerId);

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
    totalCount: Math.max(count ?? 0, listings.length),
  };

  return <ListingsGridClient initialData={initialData} />;
}
