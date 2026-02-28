import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import type { Notification } from "@/lib/types/listing";

// Initial page load → Server Component, passes initialData to client wrapper
export default async function ListerNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <>
      <ListerDashboardHeader title="Notifications" />
      <NotificationsClient
        userId={user.id}
        initialNotifications={(notifications ?? []) as Notification[]}
        userRole="lister"
      />
    </>
  );
}
