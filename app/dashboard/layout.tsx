import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth guard only - no data fetching
  if (!user) redirect("/");
  if (user.user_metadata?.user_type !== "student") redirect("/");

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </div>
  );
}
