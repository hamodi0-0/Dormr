import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { NoTenantsPrompt } from "@/components/tenants/no-tenants-prompt";
import { ConfirmedTenantRow } from "@/components/tenants/confirmed-tenant-row";
import { TenantCountBadge } from "@/components/tenants/tenant-count-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StudentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  university_name: string;
  major: string;
}

interface TenantRowRaw {
  id: string;
  user_id: string;
  added_at: string;
}

interface ResolvedTenant extends TenantRowRaw {
  profile: StudentProfile;
}

export default async function ListerTenantsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [listingResult, tenantsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, max_occupants, contact_phone, lister_id")
      .eq("id", id)
      .eq("lister_id", user.id)
      .single(),

    supabase
      .from("listing_tenants")
      .select("id, user_id, added_at")
      .eq("listing_id", id)
      .order("added_at", { ascending: true }),
  ]);

  if (listingResult.error || !listingResult.data) notFound();

  const listing = listingResult.data;
  const rawTenants = (tenantsResult.data ?? []) as TenantRowRaw[];

  // Step 2 — batch fetch profiles by user_id
  let tenants: ResolvedTenant[] = [];

  if (rawTenants.length > 0) {
    const userIds = rawTenants.map((t) => t.user_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("student_profiles")
      .select("id, full_name, avatar_url, university_name, major")
      .in("id", userIds);

    if (profilesError) {
      console.error("Failed to fetch tenant profiles", profilesError);
    }

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p as StudentProfile]),
    );

    tenants = rawTenants.reduce<ResolvedTenant[]>((acc, row) => {
      const profile = profileMap.get(row.user_id);
      if (profile) acc.push({ ...row, profile });
      return acc;
    }, []);
  }

  return (
    <>
      <ListerDashboardHeader title="Manage Tenants" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/lister/listings/`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to listing
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium text-foreground leading-snug">
              {listing.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tenant management
            </p>
          </div>
          <TenantCountBadge
            tenantCount={tenants.length}
            maxOccupants={listing.max_occupants}
          />
        </div>

        {tenants.length === 0 && <NoTenantsPrompt variant="lister" />}

        {tenants.length > 0 && (
          <Card className="py-0">
            <CardHeader className="pt-5 pb-0 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Confirmed Tenants
                <span className="text-muted-foreground font-normal">
                  ({tenants.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-3 pt-2">
              {tenants.map((tenant) => (
                <ConfirmedTenantRow
                  key={tenant.id}
                  listingId={id}
                  userId={tenant.user_id}
                  tenantName={tenant.profile.full_name}
                  tenantUniversity={tenant.profile.university_name}
                  addedAt={tenant.added_at}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
