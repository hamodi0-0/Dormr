import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";
import type { StudentProfile } from "@/hooks/use-student-profile";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function StudentHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userType = user.user_metadata?.user_type;
  if (userType !== "student") {
    redirect("/lister/dashboard");
  }

  // Fetch profile only — no listings needed on home page
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.full_name) redirect("/onboarding");

  return (
    <>
      <DashboardHeader title="Home" />
      <DashboardHomeClient initialProfile={profile as StudentProfile} />
    </>
  );
}
