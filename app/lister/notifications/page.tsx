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

  // Get all listing IDs for this lister
  const { data: listingRows } = await supabase
    .from("listings")
    .select("id")
    .eq("lister_id", user.id)
    .neq("status", "archived");

  const listingIds = (listingRows ?? []).map((l) => l.id);

  let initialData: ListerNotificationItem[] = [];

  if (listingIds.length > 0) {
    const { data: requests } = await supabase
      .from("tenant_requests")
      .select(
        `
        id,
        listing_id,
        status,
        message,
        created_at,
        updated_at,
        listings(title),
        student_profiles(full_name, avatar_url, university_name, major)
      `,
      )
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false })
      .limit(50);

    console.log("Requests >>>>>>>>>>", requests); //null
    console.log("ids >>>>>>>>>>", listingIds); // Array [ "dbf84ab4-3a17-484b-b243-026c03b1d787", "74c41a71-a76c-4316-822d-4946f331b193" ]

    initialData = (requests ?? []).map((row) => {
      const listing = normaliseSingle(
        row.listings as { title: string } | { title: string }[] | null,
      );
      const profile = normaliseSingle(
        row.student_profiles as
          | {
              full_name: string;
              avatar_url: string | null;
              university_name: string;
              major: string;
            }
          | {
              full_name: string;
              avatar_url: string | null;
              university_name: string;
              major: string;
            }[]
          | null,
      );

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

  console.log("Data >>>>>>>>>>", initialData); //Array []

  return (
    <>
      <ListerDashboardHeader title="Notifications" />
      <ListerNotificationsClient userId={user.id} initialData={initialData} />
    </>
  );
}
