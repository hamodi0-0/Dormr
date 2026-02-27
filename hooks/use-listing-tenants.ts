import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface TenantWithProfile {
  id: string;
  user_id: string;
  added_at: string;
  student_profiles: {
    full_name: string;
    avatar_url: string | null;
    university_name: string;
    major: string;
  } | unknown;
}

export function useListingTenants(listingId: string) {
  return useQuery<TenantWithProfile[]>({
    queryKey: ["listing-tenants", listingId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listing_tenants")
        .select(
          `
          id,
          user_id,
          added_at,
          student_profiles(full_name, avatar_url, university_name, major)
        `,
        )
        .eq("listing_id", listingId);

      if (error) throw error;
      return (data ?? []) as TenantWithProfile[];
    },
  });
}
