import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/dashboard/profile-page-client";
import type { StudentProfile } from "@/hooks/use-student-profile";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Fetch initial data on server
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <>
      <DashboardHeader title="Profile" />
      <ProfilePageClient
        initialProfile={profile as StudentProfile}
        userEmail={user.email ?? ""}
      />
    </>
  );
}
