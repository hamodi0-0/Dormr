"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";
import type { CreateListingValues } from "@/lib/schemas/listing-schema";

async function createListing(values: CreateListingValues): Promise<Listing> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...values,
      lister_id: user.id,
      // New listings start as active so they're immediately visible to students.
      // Listers can pause/archive from the listings page.
      status: "active" as const,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

export function useCreateListingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      // Invalidate both caches so new listing appears immediately
      queryClient.invalidateQueries({ queryKey: ["lister-listings"] });
      queryClient.invalidateQueries({ queryKey: ["public-listings"] });
    },
  });
}
