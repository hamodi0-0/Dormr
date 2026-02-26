import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentNavHeader } from "@/components/dashboard/student-nav-header";
import { Footer } from "@/components/footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StudentNavHeader />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
