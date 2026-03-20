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

const ROOM_TYPES: RoomType[] = [
  "single",
  "shared",
  "studio",
  "entire_apartment",
];
const GENDER_PREFERENCES: GenderPreference[] = [
  "male_only",
  "female_only",
  "mixed",
  "no_preference",
];
const MAX_PRICE_OPTIONS = [500, 750, 1000, 1500, 2000] as const;

function isValidRoomType(value: unknown): value is RoomType {
  return ROOM_TYPES.includes(value as RoomType);
}

function isValidGenderPreference(value: unknown): value is GenderPreference {
  return GENDER_PREFERENCES.includes(value as GenderPreference);
}

export function normalizeFilters(f: ListingFiltersQuery): ListingFiltersQuery {
  const search = f.search.trim();
  const roomType = isValidRoomType(f.roomType) ? f.roomType : null;
  const genderPreference = isValidGenderPreference(f.genderPreference)
    ? f.genderPreference
    : null;
  const maxPrice =
    typeof f.maxPrice === "number" &&
    Number.isFinite(f.maxPrice) &&
    MAX_PRICE_OPTIONS.includes(f.maxPrice as (typeof MAX_PRICE_OPTIONS)[number])
      ? f.maxPrice
      : null;

  return {
    search,
    roomType,
    maxPrice,
    genderPreference,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isEmptyFilters(f: ListingFiltersQuery): boolean {
  const n = normalizeFilters(f);
  return !n.search && !n.roomType && n.maxPrice === null && !n.genderPreference;
}

// ─── Fetch fn ─────────────────────────────────────────────────────────────────

async function fetchListingsPage(
  page: number,
  filters: ListingFiltersQuery,
): Promise<ListingsPageResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;
  const normalized = normalizeFilters(filters);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (normalized.search) {
    const s = normalized.search;
    q = q.or(
      `title.ilike.%${s}%,city.ilike.%${s}%,university_name.ilike.%${s}%,address_line.ilike.%${s}%`,
    );
  }
  if (normalized.roomType) {
    q = q.eq("room_type", normalized.roomType);
  }
  if (normalized.maxPrice !== null) {
    q = q.lte("price_per_month", normalized.maxPrice);
  }
  if (normalized.genderPreference) {
    q = q.eq("gender_preference", normalized.genderPreference);
  }

  const { data: listingRows, count, error } = await q;
  if (error) throw new Error(error.message);

  const baseListings = (listingRows ?? []) as Listing[];
  const listingIds = baseListings.map((l) => l.id);

  const imagesByListingId = new Map<
    string,
    NonNullable<Listing["listing_images"]>
  >();

  if (listingIds.length > 0) {
    const { data: imageRows } = await supabase
      .from("listing_images")
      .select(
        "id, listing_id, storage_path, public_url, position, is_cover, created_at",
      )
      .in("listing_id", listingIds)
      .order("position", { ascending: true });

    for (const img of imageRows ?? []) {
      const bucket = imagesByListingId.get(img.listing_id) ?? [];
      bucket.push(img);
      imagesByListingId.set(img.listing_id, bucket);
    }
  }

  const listings = baseListings.map((listing) => ({
    ...listing,
    listing_images: imagesByListingId.get(listing.id) ?? [],
  }));

  const multiOccupantIds = listings
    .filter((l) => l.max_occupants > 1)
    .map((l) => l.id);

  const tenantProfiles: Record<string, TenantCompatibilityProfile[]> = {};

  if (multiOccupantIds.length > 0) {
    const { data: tenantRows } = await supabase
      .from("listing_tenants")
      .select("listing_id, user_id")
      .in("listing_id", multiOccupantIds);

    const rows = (tenantRows ?? []).filter((r) => r.user_id !== viewerId);

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
  const normalizedFilters = normalizeFilters(filters);

  const isFirstPageNoFilters = page === 1 && isEmptyFilters(normalizedFilters);

  const query = useQuery<ListingsPageResult>({
    queryKey: ["public-listings-page", page, normalizedFilters],
    queryFn: () => fetchListingsPage(page, normalizedFilters),
    initialData: isFirstPageNoFilters ? initialData : undefined,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const total = query.data?.totalCount ?? 0;
    if (page * PAGE_SIZE < total) {
      queryClient.prefetchQuery({
        queryKey: ["public-listings-page", page + 1, normalizedFilters],
        queryFn: () => fetchListingsPage(page + 1, normalizedFilters),
        staleTime: 30 * 1000,
      });
    }
  }, [page, normalizedFilters, query.data?.totalCount, queryClient]);

  return query;
}
