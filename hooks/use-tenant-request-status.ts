import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TenantRequestStatus } from "@/lib/types/listing";

interface TenantRequestStatusResult {
  status: TenantRequestStatus | "none" | "is_tenant";
  requestId: string | null;
}

export function useTenantRequestStatus(
  listingId: string,
  userId: string | null,
) {
  return useQuery<TenantRequestStatusResult>({
    queryKey: ["tenant-request-status", listingId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient();

      // Check if already a confirmed tenant
      const { data: tenant } = await supabase
        .from("listing_tenants")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId!)
        .maybeSingle();

      if (tenant) return { status: "is_tenant", requestId: null };

      // Check for an existing request
      const { data: request } = await supabase
        .from("tenant_requests")
        .select("id, status")
        .eq("listing_id", listingId)
        .eq("requester_id", userId!)
        .maybeSingle();

      if (!request) return { status: "none", requestId: null };
      return { status: request.status, requestId: request.id };
    },
  });
}
