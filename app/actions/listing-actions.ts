"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1 field → Server Action + Zod (per diagram)
const updateContactPhoneSchema = z.object({
  listing_id: z.string().uuid(),
  contact_phone: z.string().max(30).optional(),
});

export async function updateContactPhone(
  formData: FormData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = updateContactPhoneSchema.safeParse({
    listing_id: formData.get("listing_id"),
    contact_phone: formData.get("contact_phone") || undefined,
  });
  if (!parsed.success) return { error: "Invalid data" };

  const { listing_id, contact_phone } = parsed.data;

  const { data: listing } = await supabase
    .from("listings")
    .select("lister_id")
    .eq("id", listing_id)
    .single();

  if (!listing || listing.lister_id !== user.id)
    return { error: "Unauthorized" };

  const { error } = await supabase
    .from("listings")
    .update({
      contact_phone: contact_phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listing_id);

  if (error) return { error: error.message };

  revalidatePath(`/lister/listings/${listing_id}/tenants`);
  return { error: null };
}
