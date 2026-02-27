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

  // Prevent requesting your own listing
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

  // Get requester's name for the notification
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Notify the lister
  await supabase.from("notifications").insert({
    user_id: listing.lister_id,
    type: "tenant_request_received",
    title: "New tenant request",
    body: `${profile?.full_name ?? "A student"} wants to be listed as a tenant on "${listing.title}"`,
    metadata: {
      listing_id: listing.id,
      listing_title: listing.title,
      requester_name: profile?.full_name ?? null,
    },
  });

  revalidatePath(`/dashboard/listings/${parsed.data.listing_id}`);
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
  if ((request.listings as { lister_id: string }).lister_id !== user.id)
    return { error: "Unauthorized" };

  // Insert into listing_tenants
  const { error: tenantError } = await supabase.from("listing_tenants").insert({
    listing_id: request.listing_id,
    user_id: request.requester_id,
  });

  if (tenantError && tenantError.code !== "23505")
    return { error: tenantError.message };

  // Update request status
  await supabase
    .from("tenant_requests")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  // Notify the student
  await supabase.from("notifications").insert({
    user_id: request.requester_id,
    type: "request_accepted",
    title: "Tenant request accepted",
    body: `You've been added as a tenant on "${(request.listings as { title: string }).title}"`,
    metadata: {
      listing_id: request.listing_id,
      request_id: requestId,
      listing_title: (request.listings as { title: string }).title,
    },
  });

  revalidatePath(`/lister/listings/${request.listing_id}/tenants`);
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
  if ((request.listings as { lister_id: string }).lister_id !== user.id)
    return { error: "Unauthorized" };

  await supabase
    .from("tenant_requests")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  // Notify the student
  await supabase.from("notifications").insert({
    user_id: request.requester_id,
    type: "request_rejected",
    title: "Tenant request declined",
    body: `Your request to be listed as a tenant on "${(request.listings as { title: string }).title}" was declined`,
    metadata: {
      listing_id: request.listing_id,
      request_id: requestId,
      listing_title: (request.listings as { title: string }).title,
    },
  });

  revalidatePath(`/lister/listings/${request.listing_id}/tenants`);
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

// ─── Mark notification as read ────────────────────────────────────────────────

export async function markNotificationRead(
  notificationId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/lister/notifications");
  return { error: null };
}

export async function markAllNotificationsRead(): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/lister/notifications");
  return { error: null };
}
