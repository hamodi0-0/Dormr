"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Listing, ListingStatus } from "@/lib/types/listing";
import type { CreateListingValues } from "@/lib/schemas/listing-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * DB-level fields that are NOT part of the create form schema but can still
 * be patched directly (e.g. status transitions from the card action buttons).
 */
interface ListingDbFields {
  status?: ListingStatus;
}

/**
 * Allow callers to supply any combination of form-driven values and DB fields.
 * Keeping them as a union (rather than widening CreateListingValues) preserves
 * the strict form schema boundary.
 */
export type ListingUpdates = Partial<CreateListingValues> & ListingDbFields;

interface UpdateListingInput {
  id: string;
  updates: ListingUpdates;
}

// ─── Mutation fn ──────────────────────────────────────────────────────────────

async function updateListing({
  id,
  updates,
}: UpdateListingInput): Promise<Listing> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("lister_id", user.id) // extra guard — RLS also enforces this
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUpdateListingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateListing,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["lister-listings"] });

      const previousListings = queryClient.getQueryData<Listing[]>([
        "lister-listings",
      ]);

      // Optimistically apply the patch to the local cache
      queryClient.setQueryData<Listing[]>(
        ["lister-listings"],
        (old) =>
          old?.map((l) => (l.id === id ? { ...l, ...updates } : l)) ?? [],
      );

      return { previousListings };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(["lister-listings"], context.previousListings);
      }
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData<Listing[]>(
        ["lister-listings"],
        (old) =>
          old?.map((l) => (l.id === updatedListing.id ? updatedListing : l)) ??
          [],
      );
    },
  });
}
