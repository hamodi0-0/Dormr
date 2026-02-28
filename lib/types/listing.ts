// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoomType = "single" | "shared" | "studio" | "entire_apartment";
export type GenderPreference =
  | "male_only"
  | "female_only"
  | "mixed"
  | "no_preference";

/**
 * Maps directly to the Supabase `listing_status` enum.
 * - draft     : saved but not yet visible to students
 * - active    : live and searchable
 * - paused    : temporarily hidden by the lister
 * - archived  : soft-deleted / no longer relevant
 */
export type ListingStatus = "draft" | "active" | "paused" | "archived";

/**
 * Maps directly to the Supabase `billing_period` enum.
 * Represents how frequently the listed price is charged.
 */
export type BillingPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annually"
  | "annually";

// ─── Core types ───────────────────────────────────────────────────────────────

/**
 * Matches the `listings` table row.
 * Amenity booleans are flat columns (not a JSON object).
 */
export interface Listing {
  id: string;
  lister_id: string;

  // Content
  title: string;
  description: string | null;
  room_type: RoomType;
  price_per_month: number;
  billing_period: BillingPeriod;
  available_from: string; // ISO date string
  min_stay_months: number;
  max_occupants: number;

  //Contact
  contact_phone: string | null;

  // Location
  address_line: string;
  city: string;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;

  // Preferences
  gender_preference: GenderPreference;
  university_name: string | null;

  // Amenities (flat boolean columns)
  wifi: boolean;
  parking: boolean;
  laundry: boolean;
  gym: boolean;
  bills_included: boolean;
  furnished: boolean;

  // Meta
  status: ListingStatus;
  created_at: string;
  updated_at: string;

  // Joined relations (optional — only present when explicitly selected)
  listing_images?: ListingImage[];
}

/**
 * Matches the `listing_images` table row.
 */
export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string; // path inside the storage bucket
  public_url: string; // full public URL for display
  position: number; // 0 = first, ascending
  is_cover: boolean;
  created_at: string;
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: "Single Room",
  shared: "Shared Room",
  studio: "Studio",
  entire_apartment: "Entire Apartment",
};

export const GENDER_PREFERENCE_LABELS: Record<GenderPreference, string> = {
  male_only: "Male Only",
  female_only: "Female Only",
  mixed: "Mixed",
  no_preference: "No Preference",
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly (every 3 months)",
  semi_annually: "Semi-annually (every 6 months)",
  annually: "Annually (yearly)",
};

/**
 * Short suffix shown next to price, e.g. "£650 /mo" or "£7,800 /yr".
 */
export const BILLING_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  weekly: "/wk",
  monthly: "/mo",
  quarterly: "/qtr",
  semi_annually: "/6mo",
  annually: "/yr",
};

/**
 * Returns an array of human-readable amenity labels for a listing.
 * Only includes amenities that are true.
 */
export function getAmenityLabels(listing: Listing): string[] {
  const map: Array<[keyof Listing, string]> = [
    ["wifi", "WiFi"],
    ["parking", "Parking"],
    ["laundry", "Laundry"],
    ["gym", "Gym"],
    ["bills_included", "Bills Included"],
    ["furnished", "Furnished"],
  ];
  return map.filter(([key]) => listing[key] === true).map(([, label]) => label);
}

/**
 * Returns the cover image URL for a listing, or null if no images.
 */
export function getCoverImageUrl(listing: Listing): string | null {
  if (!listing.listing_images?.length) return null;
  const cover = listing.listing_images.find((img) => img.is_cover);
  return (cover ?? listing.listing_images[0]).public_url;
}

/**
 * Returns true if the listing is currently visible to students.
 */
export function isListingAvailable(listing: Listing): boolean {
  return listing.status === "active";
}

export type TenantRequestStatus = "pending" | "accepted" | "rejected";

export interface TenantRequest {
  id: string;
  listing_id: string;
  requester_id: string;
  status: TenantRequestStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingTenant {
  id: string;
  listing_id: string;
  user_id: string;
  added_at: string;
}

export type NotificationType =
  | "tenant_request_received"
  | "request_accepted"
  | "request_rejected";

export interface NotificationMetadata {
  listing_id: string;
  request_id: string;
  listing_title: string;
  requester_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: NotificationMetadata | null;
  read: boolean;
  created_at: string;
}

// Extend the existing Listing type to include tenant count
export interface ListingWithTenantCount extends Listing {
  tenant_count: number; // derived from listing_tenants aggregate
}
