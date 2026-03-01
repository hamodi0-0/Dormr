"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Submit a tenant request (student side) ───────────────────────────────────

const tenantRequestSchema = z.object({
  listing_id: z.string().uuid(),
  message: z.string().max(300).optional(),
});

export async function submitTenantRequest(
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = tenantRequestSchema.safeParse({
    listing_id: formData.get("listing_id"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) return { error: "Invalid data" };

  const { data: listing } = await supabase
    .from("listings")
    .select("id, lister_id, title, max_occupants")
    .eq("id", parsed.data.listing_id)
    .single();

  if (!listing) return { error: "Listing not found" };
  if (listing.lister_id === user.id)
    return { error: "You cannot request your own listing" };
  if (listing.max_occupants <= 1)
    return { error: "This listing does not support tenant requests" };

  const { error } = await supabase.from("tenant_requests").insert({
    listing_id: parsed.data.listing_id,
    requester_id: user.id,
    message: parsed.data.message ?? null,
  });

  if (error) {
    if (error.code === "23505")
      return { error: "You already have a pending request for this listing" };
    return { error: error.message };
  }

  revalidatePath(`/dashboard/listings/${parsed.data.listing_id}`);
  revalidatePath(`/lister/notifications`);
  return { error: null };
}

// ─── Accept a tenant request (lister side) ────────────────────────────────────

export async function acceptTenantRequest(
  requestId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: request } = await supabase
    .from("tenant_requests")
    .select("*, listings(title, lister_id)")
    .eq("id", requestId)
    .single();

  if (!request) return { error: "Request not found" };

  const listingData = Array.isArray(request.listings)
    ? request.listings[0]
    : request.listings;

  if ((listingData as { lister_id: string }).lister_id !== user.id)
    return { error: "Unauthorized" };

  const { error: tenantError } = await supabase.from("listing_tenants").insert({
    listing_id: request.listing_id,
    user_id: request.requester_id,
  });

  if (tenantError && tenantError.code !== "23505")
    return { error: tenantError.message };

  const { error: updateError } = await supabase
    .from("tenant_requests")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/lister/listings/${request.listing_id}/tenants`);
  revalidatePath(`/lister/notifications`);
  revalidatePath(`/dashboard/notifications`);
  return { error: null };
}

// ─── Reject a tenant request (lister side) ────────────────────────────────────

export async function rejectTenantRequest(
  requestId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: request } = await supabase
    .from("tenant_requests")
    .select("*, listings(title, lister_id)")
    .eq("id", requestId)
    .single();

  if (!request) return { error: "Request not found" };

  const listingData = Array.isArray(request.listings)
    ? request.listings[0]
    : request.listings;

  if ((listingData as { lister_id: string }).lister_id !== user.id)
    return { error: "Unauthorized" };

  const { error: updateError } = await supabase
    .from("tenant_requests")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/lister/listings/${request.listing_id}/tenants`);
  revalidatePath(`/lister/notifications`);
  revalidatePath(`/dashboard/notifications`);
  return { error: null };
}

// ─── Remove a confirmed tenant (lister side) ─────────────────────────────────

export async function removeTenant(
  listingId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: listing } = await supabase
    .from("listings")
    .select("lister_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.lister_id !== user.id)
    return { error: "Unauthorized" };

  await supabase
    .from("listing_tenants")
    .delete()
    .eq("listing_id", listingId)
    .eq("user_id", userId);

  revalidatePath(`/lister/listings/${listingId}/tenants`);
  return { error: null };
}

export async function markStudentNotificationsRead(
  requestIds: string[],
): Promise<{ error: string | null }> {
  if (requestIds.length === 0) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("tenant_requests")
    .update({ read_at: new Date().toISOString() })
    .in("id", requestIds)
    .eq("requester_id", user.id) // security: only own requests
    .is("read_at", null); // only update actually unread ones

  if (error) return { error: error.message };
  return { error: null };
}
