import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";
import type { StudentProfile } from "@/hooks/use-student-profile";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");
  if (user.user_metadata?.user_type !== "student") redirect("/");

  // Fetch initial data on server (faster, no loading state)
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.full_name) redirect("/onboarding");

  return (
    <>
      <DashboardHeader title="Dashboard" />
      {/* Pass server data as initialData to React Query */}
      <DashboardHomeClient initialProfile={profile as StudentProfile} />
    </>
  );
}
