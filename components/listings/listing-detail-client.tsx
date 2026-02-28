"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Wifi,
  Car,
  Dumbbell,
  Zap,
  Home,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  ExternalLink,
  Images,
  Shirt,
  Shield,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Listing, ListingImage } from "@/lib/types/listing";
import {
  ROOM_TYPE_LABELS,
  BILLING_PERIOD_SUFFIX,
  GENDER_PREFERENCE_LABELS,
} from "@/lib/types/listing";
import { AnonymousTenantCard } from "@/components/tenants/anonymous-tenant-card";
import { NoTenantsPrompt } from "@/components/tenants/no-tenants-prompt";
import { TenantRequestButton } from "@/components/tenants/tenant-request-button";
import { TenantCountBadge } from "@/components/tenants/tenant-count-badge";

interface ListingDetailClientProps {
  listing: Listing;
  tenantCount: number;
  userId: string;
}

const ListingDetailMap = dynamic(
  () =>
    import("@/components/listings/listing-detail-map").then(
      (m) => m.ListingDetailMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-lg">
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    ),
  },
);

const AMENITY_CONFIG = [
  { key: "furnished" as const, label: "Furnished", icon: Home },
  { key: "wifi" as const, label: "WiFi Included", icon: Wifi },
  { key: "parking" as const, label: "Covered Parking", icon: Car },
  { key: "laundry" as const, label: "Laundry", icon: Shirt },
  { key: "gym" as const, label: "Gym Access", icon: Dumbbell },
  { key: "bills_included" as const, label: "Bills Included", icon: Zap },
] satisfies {
  key: keyof Listing;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[];

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images }: { images: ListingImage[] }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const sorted = [...images].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.position - b.position;
  });

  const cover = sorted[0];
  const thumbnails = sorted.slice(1, 3);
  const hasMore = images.length > 3;
  const extraCount = images.length - 3;

  if (!images.length) {
    return (
      <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Home className="h-12 w-12 opacity-20" />
          <span className="text-sm">No photos available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 h-64 sm:h-80 lg:h-105 rounded-xl overflow-hidden">
        <div
          className="col-span-2 relative cursor-pointer group overflow-hidden"
          onClick={() => {
            setActiveIdx(0);
            setGalleryOpen(true);
          }}
        >
          <Image
            src={cover.public_url}
            alt="Main photo"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 66vw, (max-width: 1024px) 50vw, 660px"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        <div className="flex flex-col gap-2">
          {thumbnails.map((img, idx) => (
            <div
              key={img.id}
              className="flex-1 relative cursor-pointer group overflow-hidden"
              onClick={() => {
                setActiveIdx(idx + 1);
                setGalleryOpen(true);
              }}
            >
              <Image
                src={img.public_url}
                alt={`Photo ${idx + 2}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 220px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              {idx === 1 && hasMore && (
                <div
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(0);
                    setGalleryOpen(true);
                  }}
                >
                  <Images className="h-5 w-5 text-white" />
                  <span className="text-white text-xs font-semibold">
                    +{extraCount} more
                  </span>
                </div>
              )}
            </div>
          ))}
          {thumbnails.length === 0 && images.length > 1 && (
            <div
              className="flex-1 relative cursor-pointer bg-muted flex items-center justify-center"
              onClick={() => {
                setActiveIdx(1);
                setGalleryOpen(true);
              }}
            >
              <span className="text-xs text-muted-foreground">View more</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <button
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm hover:bg-black/75 transition-colors"
            onClick={() => {
              setActiveIdx(0);
              setGalleryOpen(true);
            }}
          >
            <Images className="h-3.5 w-3.5" />
            {images.length} photos
          </button>
        </div>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden bg-background">
          <DialogHeader className="px-4 py-3 border-b border-border">
            <DialogTitle className="text-sm font-medium">
              {activeIdx + 1} / {sorted.length}
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-[60vh] bg-black">
            <Image
              src={sorted[activeIdx].public_url}
              alt={`Photo ${activeIdx + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {sorted.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-muted/30">
              {sorted.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    "relative h-14 w-20 shrink-0 rounded overflow-hidden border-2 transition-all",
                    idx === activeIdx
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={img.public_url}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────

function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Tenants Section ──────────────────────────────────────────────────────────

function TenantsSection({
  listing,
  tenantCount,
  userId,
}: {
  listing: Listing;
  tenantCount: number;
  userId: string;
}) {
  const isMultiOccupant = listing.max_occupants > 1;

  // Single-occupant listings don't have tenant/compatibility features
  if (!isMultiOccupant) return null;

  return (
    <Card className="py-0">
      <CardHeader className="pt-5 pb-0 px-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Tenants
          </CardTitle>
          <TenantCountBadge
            tenantCount={tenantCount}
            maxOccupants={listing.max_occupants}
          />
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4 space-y-4">
        {/* Anonymous tenant cards or empty state */}
        {tenantCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: tenantCount }).map((_, i) => (
              <AnonymousTenantCard key={i} index={i + 1} />
            ))}
          </div>
        ) : (
          <NoTenantsPrompt variant="student" />
        )}

        {/* Tenant request button — hidden if listing is full */}
        {tenantCount < listing.max_occupants && (
          <div className="pt-1">
            <TenantRequestButton listingId={listing.id} userId={userId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ListingDetailClient({
  listing,
  tenantCount,
  userId,
}: ListingDetailClientProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  const images = listing.listing_images ?? [];
  const priceSuffix = BILLING_PERIOD_SUFFIX[listing.billing_period] ?? "/mo";

  const availableDate = new Date(listing.available_from).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const activeAmenities = AMENITY_CONFIG.filter(
    ({ key }) => listing[key] === true,
  );

  const fullAddress = [
    listing.address_line,
    listing.city,
    listing.postcode,
    listing.country,
  ]
    .filter(Boolean)
    .join(", ");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const shouldTruncateDesc =
    listing.description && listing.description.length > 300;

  const displayDesc =
    shouldTruncateDesc && !descExpanded
      ? listing.description!.slice(0, 300) + "…"
      : listing.description;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Back link */}
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="relative mb-6">
        <ImageGallery images={images} />
      </div>

      {/* Main layout: content + sticky sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 xl:gap-8">
        {/* ── LEFT ── */}
        <div className="space-y-5 min-w-0">
          {/* Price + quick stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-serif font-semibold text-foreground">
                £{listing.price_per_month.toLocaleString()}
              </span>
              <span className="text-base text-muted-foreground font-normal">
                {priceSuffix}
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <StatBadge
                icon={Users}
                label="Max Occupants"
                value={String(listing.max_occupants)}
              />
              <StatBadge
                icon={Clock}
                label="Min Stay"
                value={`${listing.min_stay_months} month${listing.min_stay_months !== 1 ? "s" : ""}`}
              />
              <StatBadge
                icon={Calendar}
                label="Available"
                value={availableDate}
              />
            </div>
          </div>

          {/* Subtitle + Title */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {ROOM_TYPE_LABELS[listing.room_type]} · {listing.city}
              {listing.country !== "United Kingdom"
                ? `, ${listing.country}`
                : ""}
            </p>
            <h1 className="text-xl sm:text-2xl font-serif font-medium text-foreground leading-snug">
              {listing.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">
                {fullAddress}
              </span>
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">
                About this listing
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {displayDesc}
              </p>
              {shouldTruncateDesc && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {descExpanded ? (
                    <>
                      Show less <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      See full description{" "}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Property Details */}
          <Card className="py-0">
            <CardHeader className="pt-5 pb-0 px-5">
              <CardTitle className="text-sm font-semibold">
                Property details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-5 px-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
                {[
                  {
                    label: "Property Type",
                    value: ROOM_TYPE_LABELS[listing.room_type],
                  },
                  {
                    label: "Max Occupants",
                    value: String(listing.max_occupants),
                  },
                  { label: "Available From", value: availableDate },
                  {
                    label: "Min Stay",
                    value: `${listing.min_stay_months} month${listing.min_stay_months !== 1 ? "s" : ""}`,
                  },
                  {
                    label: "Gender Preference",
                    value: GENDER_PREFERENCE_LABELS[listing.gender_preference],
                  },
                  ...(listing.university_name
                    ? [
                        {
                          label: "Target University",
                          value: listing.university_name,
                        },
                      ]
                    : []),
                ].map(({ label, value }, idx) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-start justify-between py-3 sm:py-2.5",
                      idx % 2 === 0
                        ? "sm:pr-6"
                        : "sm:pl-6 sm:border-l sm:border-border/50",
                    )}
                  >
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-medium text-foreground text-right max-w-[55%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {activeAmenities.length > 0 && (
            <Card className="py-0">
              <CardHeader className="pt-5 pb-0 px-5">
                <CardTitle className="text-sm font-semibold">
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-5 px-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeAmenities.map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-muted/50 border border-border/40"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Tenants section (multi-occupant listings only) ── */}
          <TenantsSection
            listing={listing}
            tenantCount={tenantCount}
            userId={userId}
          />

          {/* Location */}
          <Card className="py-0">
            <CardHeader className="pt-5 pb-0 px-5">
              <CardTitle className="text-sm font-semibold">Location</CardTitle>
            </CardHeader>
            <CardContent className="pb-5 px-5 space-y-3">
              {listing.latitude && listing.longitude ? (
                <div className="rounded-lg overflow-hidden border border-border h-54">
                  <ListingDetailMap
                    key={`map-${listing.id}`}
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    title={listing.title}
                    address={[listing.address_line, listing.city]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
              ) : null}

              <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {listing.address_line}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[listing.city, listing.postcode, listing.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  View on map
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Sticky Sidebar ── */}
        <div className="lg:sticky lg:top-20 self-start space-y-4">
          {/* Price card */}
          <Card className="py-0">
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-serif font-semibold text-foreground">
                    £{listing.price_per_month.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {priceSuffix}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {ROOM_TYPE_LABELS[listing.room_type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    Available{" "}
                    {new Date(listing.available_from).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-2.5">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  disabled
                >
                  <Phone className="h-4 w-4" />
                  Call Lister
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-10"
                  disabled
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Lister
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground bg-muted/50 rounded-md py-2 px-3">
                Direct contact coming soon. Check back shortly!
              </p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    label: "Min stay",
                    value: `${listing.min_stay_months} month${listing.min_stay_months !== 1 ? "s" : ""}`,
                  },
                  {
                    label: "Max occupants",
                    value: String(listing.max_occupants),
                  },
                  {
                    label: "Gender pref.",
                    value: GENDER_PREFERENCE_LABELS[listing.gender_preference],
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safety card */}
          <Card className="py-0 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    Verified listing
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This property is listed by a verified Dormr lister. Always
                    visit in person before committing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* University target */}
          {listing.university_name && (
            <Card className="py-0">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">
                      Near your university
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.university_name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
