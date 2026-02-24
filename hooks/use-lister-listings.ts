"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";

async function fetchListerListings(): Promise<Listing[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
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

  if (error) throw error;
  return (data ?? []) as Listing[];
}

/**
 * Data changes when the lister creates/edits/archives listings → React Query.
 */
export function useListerListings(initialData?: Listing[]) {
  return useQuery({
    queryKey: ["lister-listings"],
    queryFn: fetchListerListings,
    initialData,
    staleTime: 30 * 1000,
  });
}
