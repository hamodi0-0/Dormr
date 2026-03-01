import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { ListerNotificationsClient } from "@/components/notifications/notifications-client";
import type { ListerNotificationItem } from "@/hooks/use-notifications";

function normaliseSingle<T>(val: T | T[] | null): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

export default async function ListerNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: listingRows } = await supabase
    .from("listings")
    .select("id")
    .eq("lister_id", user.id)
    .neq("status", "archived");

  const listingIds = (listingRows ?? []).map((l) => l.id);

  let initialData: ListerNotificationItem[] = [];

  if (listingIds.length > 0) {
    // Step 1: fetch requests + listing title (FK exists: listing_id → listings.id)
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

    if (requestsError) {
      console.error("Requests error:", requestsError);
    }

    if (requests && requests.length > 0) {
      // Step 2: fetch student profiles separately (requester_id → auth.users, not public.student_profiles)
      const requesterIds = [...new Set(requests.map((r) => r.requester_id))];

      const { data: profiles, error: profilesError } = await supabase
        .from("student_profiles")
        .select("id, full_name, avatar_url, university_name, major")
        .in("id", requesterIds);

      if (profilesError) {
        console.error("Profiles error:", profilesError);
      }

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      initialData = requests.map((row) => {
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
          status: row.status as ListerNotificationItem["status"],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      });
    }
  }

  return (
    <>
      <ListerDashboardHeader title="Notifications" />
      <ListerNotificationsClient userId={user.id} initialData={initialData} />
    </>
  );
}
