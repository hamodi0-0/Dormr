import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TenantRequestStatus } from "@/lib/types/listing";

export interface ListerNotificationItem {
  requestId: string;
  listingId: string;
  listingTitle: string;
  requesterName: string;
  requesterAvatar: string | null;
  requesterUniversity: string;
  requesterMajor: string;
  message: string | null;
  status: TenantRequestStatus;
  createdAt: string;
  updatedAt: string;
}

function normaliseSingle<T>(val: T | T[] | null): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

async function fetchListerNotifications(
  liserId: string,
): Promise<ListerNotificationItem[]> {
  const supabase = createClient();

  const { data: listingRows } = await supabase
    .from("listings")
    .select("id")
    .eq("lister_id", liserId)
    .neq("status", "archived");

  const listingIds = (listingRows ?? []).map((l) => l.id);
  if (listingIds.length === 0) return [];

  const { data: requests, error: requestsError } = await supabase
    .from("tenant_requests")
    .select(
      `
      id,
      listing_id,
      requester_id,
      status,
      message,
      created_at,
      updated_at,
      listings(title)
    `,
    )
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false })
    .limit(50);

  if (requestsError) throw requestsError;
  if (!requests || requests.length === 0) return [];

  const requesterIds = [...new Set(requests.map((r) => r.requester_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("student_profiles")
    .select("id, full_name, avatar_url, university_name, major")
    .in("id", requesterIds);

  if (profilesError) throw profilesError;

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return requests.map((row) => {
    const listing = normaliseSingle(
      row.listings as { title: string } | { title: string }[] | null,
    );
    const profile = profileMap.get(row.requester_id) ?? null;

    return {
      requestId: row.id,
      listingId: row.listing_id,
      listingTitle: listing?.title ?? "Unknown listing",
      requesterName: profile?.full_name ?? "Unknown student",
      requesterAvatar: profile?.avatar_url ?? null,
      requesterUniversity: profile?.university_name ?? "",
      requesterMajor: profile?.major ?? "",
      message: row.message ?? null,
      status: row.status as TenantRequestStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export function useListerNotifications(
  liserId: string | null,
  initialData?: ListerNotificationItem[],
) {
  return useQuery<ListerNotificationItem[]>({
    queryKey: ["lister-notifications", liserId],
    enabled: !!liserId,
    initialData,
    queryFn: () => fetchListerNotifications(liserId!),
    staleTime: 30 * 1000,
  });
}

export function useListerPendingCount(liserId: string | null): number {
  const { data } = useListerNotifications(liserId);
  return data?.filter((n) => n.status === "pending").length ?? 0;
}

// ─── Student notifications ────────────────────────────────────────────────────

export interface StudentNotificationItem {
  requestId: string;
  listingId: string;
  listingTitle: string;
  listingCity: string;
  status: TenantRequestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null; // null = unread
}

async function fetchStudentNotifications(
  userId: string,
): Promise<StudentNotificationItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tenant_requests")
    .select(
      `
      id,
      listing_id,
      status,
      message,
      created_at,
      updated_at,
      read_at,
      listings(title, city)
    `,
    )
    .eq("requester_id", userId)
    .neq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const listing = normaliseSingle(
      row.listings as
        | { title: string; city: string }
        | { title: string; city: string }[]
        | null,
    );

    return {
      requestId: row.id,
      listingId: row.listing_id,
      listingTitle: listing?.title ?? "Unknown listing",
      listingCity: listing?.city ?? "",
      status: row.status as TenantRequestStatus,
      message: row.message ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      readAt: row.read_at ?? null,
    };
  });
}

export function useStudentNotifications(
  userId: string | null,
  initialData?: StudentNotificationItem[],
) {
  return useQuery<StudentNotificationItem[]>({
    queryKey: ["student-notifications", userId],
    enabled: !!userId,
    initialData,
    queryFn: () => fetchStudentNotifications(userId!),
    staleTime: 30 * 1000,
  });
}

// Unread = non-pending AND read_at is null
export function useStudentUnreadCount(userId: string | null): number {
  const { data } = useStudentNotifications(userId);
  return data?.filter((n) => n.readAt === null).length ?? 0;
}
