import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface RequestWithProfile {
  id: string;
  requester_id: string;
  status: string;
  message: string | null;
  created_at: string;
  student_profiles:
    | {
        full_name: string;
        avatar_url: string | null;
        university_name: string;
        major: string;
      }
    | unknown;
}

export function usePendingRequests(listingId: string) {
  return useQuery<RequestWithProfile[]>({
    queryKey: ["pending-requests", listingId],
    queryFn: async () => {
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
          student_profiles(full_name, avatar_url, university_name, major)
        `,
        )
        .eq("listing_id", listingId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as RequestWithProfile[];
    },
  });
}
