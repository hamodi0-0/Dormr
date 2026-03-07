import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ListingDetailClient } from "@/components/listings/listing-detail-client";
import type { Listing } from "@/lib/types/listing";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (user.user_metadata?.user_type !== "student") redirect("/");

  const [listingResult, tenantRowsResult] = await Promise.all([
    supabase
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
      .eq("id", id)
      .eq("status", "active")
      .single(),

    supabase.from("listing_tenants").select("user_id").eq("listing_id", id),
  ]);

  if (listingResult.error || !listingResult.data) notFound();

  const tenantUserIds = (tenantRowsResult.data ?? []).map((r) => r.user_id);
  const tenantCount = tenantUserIds.length;

  let tenantProfiles: TenantCompatibilityProfile[] = [];

  if (tenantUserIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("student_profiles")
      .select(
        "id, sleep_schedule, cleanliness, noise_level, guests_frequency, smoking, pets, major, hobbies",
      )
      .in("id", tenantUserIds);

    tenantProfiles = (profileRows ?? []) as TenantCompatibilityProfile[];
  }

  return (
    <ListingDetailClient
      listing={listingResult.data as Listing}
      tenantCount={tenantCount}
      tenantProfiles={tenantProfiles}
      userId={user.id}
    />
  );
}
