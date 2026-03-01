// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoomType = "single" | "shared" | "studio" | "entire_apartment";
export type GenderPreference =
  | "male_only"
  | "female_only"
  | "mixed"
  | "no_preference";

export type ListingStatus = "draft" | "active" | "paused" | "archived";

export type BillingPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annually"
  | "annually";

// ─── Core types ───────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  lister_id: string;
  title: string;
  description: string | null;
  room_type: RoomType;
  price_per_month: number;
  billing_period: BillingPeriod;
  available_from: string;
  min_stay_months: number;
  max_occupants: number;
  contact_phone: string | null;
  address_line: string;
  city: string;
  postcode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  gender_preference: GenderPreference;
  university_name: string | null;
  wifi: boolean;
  parking: boolean;
  laundry: boolean;
  gym: boolean;
  bills_included: boolean;
  furnished: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  public_url: string;
  position: number;
  is_cover: boolean;
  created_at: string;
}

// ─── Tenant request types ─────────────────────────────────────────────────────

export type TenantRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "removed";

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

export interface ListingWithTenantCount extends Listing {
  tenant_count: number;
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

export const BILLING_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  weekly: "/wk",
  monthly: "/mo",
  quarterly: "/qtr",
  semi_annually: "/6mo",
  annually: "/yr",
};

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

export function getCoverImageUrl(listing: Listing): string | null {
  if (!listing.listing_images?.length) return null;
  const cover = listing.listing_images.find((img) => img.is_cover);
  return (cover ?? listing.listing_images[0]).public_url;
}

export function isListingAvailable(listing: Listing): boolean {
  return listing.status === "active";
}
