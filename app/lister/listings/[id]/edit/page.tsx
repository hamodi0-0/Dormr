import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { ListingForm } from "@/components/listings/listing-form";
import type { Listing } from "@/lib/types/listing";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch the listing with its images — confirm ownership server-side
  // Archived listings cannot be edited
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
    .eq("lister_id", user.id) // ownership guard
    .neq("status", "archived")
    .single();

  if (error || !listing) notFound();

  return (
    <>
      <ListerDashboardHeader title="Edit Listing" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <ListingForm mode="edit" listing={listing as Listing} />
      </main>
    </>
  );
}
