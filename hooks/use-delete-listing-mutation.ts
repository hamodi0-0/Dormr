"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";

/**
 * Soft-deletes a listing by setting its status to "archived".
 * This preserves the row for audit purposes while removing it from all views.
 */
async function archiveListing(id: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("listings")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("lister_id", user.id); // ownership guard — RLS also enforces this

  if (error) throw error;
}

export function useDeleteListingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveListing,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["lister-listings"] });

      const previousListings = queryClient.getQueryData<Listing[]>([
        "lister-listings",
      ]);

      // Optimistically remove from the local list
      queryClient.setQueryData<Listing[]>(
        ["lister-listings"],
        (old) => old?.filter((l) => l.id !== id) ?? [],
      );

      return { previousListings };
    },
    onError: (_error, _id, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(["lister-listings"], context.previousListings);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lister-listings"] });
    },
  });
}
