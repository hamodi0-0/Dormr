import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ListingDetailClient } from "@/components/listings/listing-detail-client";
import type { Listing } from "@/lib/types/listing";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

// Initial page load data → Server Component
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

  const { data: listing, error } = await supabase
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
    .single();

  if (error || !listing) notFound();

  return <ListingDetailClient listing={listing as Listing} />;
}
