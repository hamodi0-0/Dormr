import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentNotificationsClient } from "@/components/notifications/notifications-client";
import type { StudentNotificationItem } from "@/hooks/use-notifications";

function normaliseSingle<T>(val: T | T[] | null): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

export default async function StudentNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (user.user_metadata?.user_type !== "student") redirect("/");

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
      read_at,
      listings(title, city)
    `,
    )
    .eq("requester_id", user.id)
    .neq("status", "pending")
    .order("updated_at", { ascending: false })
    .limit(50);

  const initialData: StudentNotificationItem[] = (requests ?? []).map((row) => {
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
      status: row.status as StudentNotificationItem["status"],
      message: row.message ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      readAt: row.read_at ?? null,
    };
  });

  return (
    <StudentNotificationsClient userId={user.id} initialData={initialData} />
  );
}
