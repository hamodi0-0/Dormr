"use client";

import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Listing, RoomType, GenderPreference } from "@/lib/types/listing";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ListingFiltersQuery {
  search: string;
  roomType: RoomType | null;
  maxPrice: number | null;
  genderPreference: GenderPreference | null;
}

export interface ListingsPageResult {
  listings: Listing[];
  tenantProfiles: Record<string, TenantCompatibilityProfile[]>;
  totalCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isEmptyFilters(f: ListingFiltersQuery): boolean {
  return !f.search && !f.roomType && f.maxPrice === null && !f.genderPreference;
}

// ─── Fetch fn ─────────────────────────────────────────────────────────────────

async function fetchListingsPage(
  page: number,
  filters: ListingFiltersQuery,
): Promise<ListingsPageResult> {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("listings")
    .select(
      `
      *,
      listing_images (
        id, listing_id, storage_path, public_url, position, is_cover, created_at
      )
    `,
      { count: "exact" },
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    const s = filters.search.trim();
    q = q.or(
      `title.ilike.%${s}%,city.ilike.%${s}%,university_name.ilike.%${s}%,address_line.ilike.%${s}%`,
    );
  }
  if (filters.roomType) {
    q = q.eq("room_type", filters.roomType);
  }
  if (filters.maxPrice !== null) {
    q = q.lte("price_per_month", filters.maxPrice);
  }
  if (filters.genderPreference) {
    q = q.eq("gender_preference", filters.genderPreference);
  }

  const { data: listingRows, count, error } = await q;
  if (error) throw new Error(error.message);

  const listings = (listingRows ?? []) as Listing[];

  const multiOccupantIds = listings
    .filter((l) => l.max_occupants > 1)
    .map((l) => l.id);

  const tenantProfiles: Record<string, TenantCompatibilityProfile[]> = {};

  if (multiOccupantIds.length > 0) {
    const { data: tenantRows } = await supabase
      .from("listing_tenants")
      .select("listing_id, user_id")
      .in("listing_id", multiOccupantIds);

    const rows = tenantRows ?? [];

    if (rows.length > 0) {
      const userIds = [...new Set(rows.map((r) => r.user_id))];

      const { data: profileRows } = await supabase
        .from("student_profiles")
        .select(
          "id, sleep_schedule, cleanliness, noise_level, guests_frequency, smoking, pets, major, hobbies",
        )
        .in("id", userIds);

      const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

      for (const row of rows) {
        const profile = profileMap.get(row.user_id);
        if (!profile) continue;
        if (!tenantProfiles[row.listing_id])
          tenantProfiles[row.listing_id] = [];
        tenantProfiles[row.listing_id].push(
          profile as unknown as TenantCompatibilityProfile,
        );
      }
    }
  }

  return { listings, tenantProfiles, totalCount: count ?? 0 };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePublicListingsPage(
  page: number,
  filters: ListingFiltersQuery,
  initialData?: ListingsPageResult,
) {
  const queryClient = useQueryClient();

  const isFirstPageNoFilters = page === 1 && isEmptyFilters(filters);

  const query = useQuery<ListingsPageResult>({
    queryKey: ["public-listings-page", page, filters],
    queryFn: () => fetchListingsPage(page, filters),
    initialData: isFirstPageNoFilters ? initialData : undefined,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const total = query.data?.totalCount ?? 0;
    if (page * PAGE_SIZE < total) {
      queryClient.prefetchQuery({
        queryKey: ["public-listings-page", page + 1, filters],
        queryFn: () => fetchListingsPage(page + 1, filters),
        staleTime: 30 * 1000,
      });
    }
  }, [page, filters, query.data?.totalCount, queryClient]);

  return query;
}
