// hooks/use-listing-tenants.ts
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface TenantWithProfile {
  id: string;
  user_id: string;
  added_at: string;
  student_profiles: {
    full_name: string;
    avatar_url: string | null;
    university_name: string;
    major: string;
  };
}

async function fetchListingTenants(
  listingId: string,
): Promise<TenantWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listing_tenants")
    .select(
      `
      id,
      user_id,
      added_at,
      student_profiles (
        full_name,
        avatar_url,
        university_name,
        major
      )
    `,
    )
    .eq("listing_id", listingId)
    .order("added_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data
    .filter((row) => {
      const profile = Array.isArray(row.student_profiles)
        ? row.student_profiles[0]
        : row.student_profiles;
      return profile != null;
    })
    .map((row) => {
      const profile = Array.isArray(row.student_profiles)
        ? row.student_profiles[0]
        : row.student_profiles;

      return {
        id: row.id,
        user_id: row.user_id,
        added_at: row.added_at,
        student_profiles: {
          full_name: profile.full_name ?? "",
          avatar_url: profile.avatar_url ?? null,
          university_name: profile.university_name ?? "",
          major: profile.major ?? "",
        },
      };
    });
}

export function useListingTenants(listingId: string) {
  return useQuery({
    queryKey: ["listing-tenants", listingId],
    queryFn: () => fetchListingTenants(listingId),
    enabled: !!listingId,
  });
}
