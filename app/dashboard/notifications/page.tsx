import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/notifications/notifications-client";
import type { Notification } from "@/lib/types/listing";

// Initial page load → Server Component, passes initialData to client wrapper
export default async function StudentNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  if (user.user_metadata?.user_type !== "student") redirect("/");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <NotificationsClient
      userId={user.id}
      initialNotifications={(notifications ?? []) as Notification[]}
      userRole="student"
    />
  );
}
