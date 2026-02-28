import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ListerDashboardHeader } from "@/components/lister/lister-dashboard-header";
import { NoTenantsPrompt } from "@/components/tenants/no-tenants-prompt";
import { ConfirmedTenantRow } from "@/components/tenants/confirmed-tenant-row";
import { PendingRequestCard } from "@/components/tenants/pending-request-card";
import { TenantCountBadge } from "@/components/tenants/tenant-count-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Join shape helpers ───────────────────────────────────────────────────────

interface StudentProfileJoin {
  full_name: string;
  avatar_url: string | null;
  university_name: string;
  major: string;
}

interface TenantRow {
  id: string;
  user_id: string;
  added_at: string;
  student_profiles: StudentProfileJoin | StudentProfileJoin[] | null;
}

interface RequestRow {
  id: string;
  requester_id: string;
  message: string | null;
  created_at: string;
  student_profiles: StudentProfileJoin | StudentProfileJoin[] | null;
}

function extractProfile(
  profiles: StudentProfileJoin | StudentProfileJoin[] | null,
): StudentProfileJoin | null {
  if (!profiles) return null;
  return Array.isArray(profiles) ? (profiles[0] ?? null) : profiles;
}

// ─── Server Component — initial page load data, doesn't change frequently ────

export default async function ListerTenantsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [listingResult, tenantsResult, requestsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, max_occupants, contact_phone, lister_id")
      .eq("id", id)
      .eq("lister_id", user.id) // ownership guard
      .single(),

    supabase
      .from("listing_tenants")
      .select(
        "id, user_id, added_at, student_profiles(full_name, avatar_url, university_name, major)",
      )
      .eq("listing_id", id)
      .order("added_at", { ascending: true }),

    supabase
      .from("tenant_requests")
      .select(
        "id, requester_id, message, created_at, student_profiles(full_name, avatar_url, university_name, major)",
      )
      .eq("listing_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  if (listingResult.error || !listingResult.data) notFound();

  const listing = listingResult.data;

  const tenants = ((tenantsResult.data ?? []) as TenantRow[]).filter(
    (row) => extractProfile(row.student_profiles) !== null,
  );

  const requests = ((requestsResult.data ?? []) as RequestRow[]).filter(
    (row) => extractProfile(row.student_profiles) !== null,
  );

  return (
    <>
      <ListerDashboardHeader title="Manage Tenants" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Back link */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/lister/listings/${id}/edit`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to listing
          </Link>
        </Button>
        {/* Page header */}
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
        {/* No tenants prompt */}
        {tenants.length === 0 && <NoTenantsPrompt variant="lister" />}
        {/* Confirmed tenants */}
        {tenants.length > 0 && (
          <Card className="py-0">
            <CardHeader className="pt-5 pb-0 px-5">
              <CardTitle className="text-sm font-semibold7 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Confirmed Tenants
                <span className="text-muted-foreground font-normal">
                  ({tenants.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-3 pt-2">
              {tenants.map((tenant) => {
                const profile = extractProfile(tenant.student_profiles)!;
                return (
                  <ConfirmedTenantRow
                    key={tenant.id}
                    listingId={id}
                    userId={tenant.user_id}
                    tenantName={profile.full_name}
                    tenantUniversity={profile.university_name}
                    addedAt={tenant.added_at}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}
        {/* Pending requests */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Pending Requests
              {requests.length > 0 && (
                <span className="text-muted-foreground font-normal ml-1">
                  ({requests.length})
                </span>
              )}
            </h2>
          </div>

          {requests.length === 0 ? (
            <Card className="py-0">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => {
              const profile = extractProfile(req.student_profiles)!;
              return (
                <PendingRequestCard
                  key={req.id}
                  requestId={req.id}
                  listingId={id}
                  requesterName={profile.full_name}
                  requesterUniversity={profile.university_name}
                  requesterMajor={profile.major}
                  requesterAvatar={profile.avatar_url}
                  message={req.message}
                  createdAt={req.created_at}
                />
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
