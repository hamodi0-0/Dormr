import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface RequestWithProfile {
  id: string;
  requester_id: string;
  status: string;
  message: string | null;
  created_at: string;
  student_profiles: {
    full_name: string;
    avatar_url: string | null;
    university_name: string;
    major: string;
  };
}

async function fetchPendingRequests(
  listingId: string,
): Promise<RequestWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tenant_requests")
    .select(
      `
      id,
      requester_id,
      status,
      message,
      created_at,
      student_profiles (
        full_name,
        avatar_url,
        university_name,
        major
      )
    `,
    )
    .eq("listing_id", listingId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

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
        requester_id: row.requester_id,
        status: row.status,
        message: row.message ?? null,
        created_at: row.created_at,
        student_profiles: {
          full_name: profile.full_name ?? "",
          avatar_url: profile.avatar_url ?? null,
          university_name: profile.university_name ?? "",
          major: profile.major ?? "",
        },
      };
    });
}

export function usePendingRequests(listingId: string) {
  return useQuery({
    queryKey: ["pending-requests", listingId],
    queryFn: () => fetchPendingRequests(listingId),
    enabled: !!listingId,
  });
}
