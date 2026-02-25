"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  Home,
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  BadgePoundSterling,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useStudentProfile,
  type StudentProfile,
} from "@/hooks/use-student-profile";
import { usePublicListings } from "@/hooks/use-public-listings";
import type { Listing } from "@/lib/types/listing";
import {
  ROOM_TYPE_LABELS,
  BILLING_PERIOD_SUFFIX,
  getCoverImageUrl,
  getAmenityLabels,
} from "@/lib/types/listing";

interface DashboardHomeClientProps {
  initialProfile: StudentProfile;
  initialListings: Listing[];
}

const YEAR_LABELS: Record<string, string> = {
  "1st_year": "1st Year",
  "2nd_year": "2nd Year",
  "3rd_year": "3rd Year",
  "4th_year": "4th Year",
  graduate: "Graduate",
};
//meow
type SortKey = "newest" | "price_asc" | "price_desc";

export function DashboardHomeClient({
  initialProfile,
  initialListings,
}: DashboardHomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [filterType, setFilterType] = useState("all");

  const { data: profile } = useStudentProfile(initialProfile);
  const { data: listings = [] } = usePublicListings(initialListings);

  const firstName = profile!.full_name.split(" ")[0];
  const yearLabel =
    YEAR_LABELS[profile!.year_of_study] ?? profile!.year_of_study;

  const filtered = listings
    .filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        ROOM_TYPE_LABELS[l.room_type].toLowerCase().includes(q);

      const matchesType = filterType === "all" || l.room_type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_per_month - b.price_per_month;
      if (sortBy === "price_desc") return b.price_per_month - a.price_per_month;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const activeCount = listings.length;
  const lowestPrice = listings.length
    ? Math.min(...listings.map((l) => l.price_per_month))
    : null;

  const newThisWeek = listings.filter((l) => {
    const created = new Date(l.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {yearLabel} · {profile!.major} · {profile!.university_name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 self-start">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Compatibility Matching — Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            icon: Home,
            label: "Available Listings",
            value: String(activeCount),
            sub: "active right now",
          },
          {
            icon: BadgePoundSterling,
            label: "Lowest Price",
            value: lowestPrice ? `£${lowestPrice.toLocaleString()}` : "—",
            sub: "per billing period",
          },
          {
            icon: Calendar,
            label: "New Listings",
            value: String(newThisWeek),
            sub: "this week",
          },
          {
            icon: BookOpen,
            label: "Match Score",
            value: "Soon",
            sub: "compatibility algorithm",
          },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-serif font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="mb-6 py-0">
        <CardHeader className="pb-0 pt-5 px-5">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Find Your Room
          </CardTitle>
          <CardDescription className="text-xs">
            Search by name, location, or room type
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-5 px-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search listings, cities, room types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-10 w-auto min-w-32.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="shared">Shared Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="entire_apartment">
                    Entire Apartment
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortKey)}
              >
                <SelectTrigger className="h-10 w-auto min-w-32.5">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low → High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </h2>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              &quot;{searchQuery}&quot;
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Live data</span>
        </div>
      </div>

      {/* Listings grid */}
      {listings.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings yet</p>
            <p className="text-sm text-muted-foreground">
              Listers are adding rooms every day — check back soon!
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings match</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: Listing }) {
  const coverUrl = getCoverImageUrl(listing);
  const amenities = getAmenityLabels(listing);
  const availableDate = new Date(listing.available_from).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" },
  );

  const priceSuffix = BILLING_PERIOD_SUFFIX[listing.billing_period] ?? "/mo";

  return (
    <Link href={`/dashboard/listings/${listing.id}`} className="block group">
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 py-0 gap-0 overflow-hidden",
        )}
      >
        {/* Image */}
        <div className="relative h-40 bg-linear-to-br from-muted to-muted/50 overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}

          {/* Room type badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="text-xs bg-background/90 text-foreground"
            >
              {ROOM_TYPE_LABELS[listing.room_type]}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Name & Location */}
            <div>
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {listing.city}
                  {listing.country !== "United Kingdom"
                    ? `, ${listing.country}`
                    : ""}
                </span>
              </div>
            </div>

            {/* Price & availability */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                £{listing.price_per_month.toLocaleString()}
                <span className="text-xs font-normal text-muted-foreground">
                  {priceSuffix}
                </span>
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>From {availableDate}</span>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
                {amenities.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{amenities.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <Button
              variant="default"
              size="sm"
              className="w-full h-8 text-xs gap-1.5 group/btn pointer-events-none"
              tabIndex={-1}
            >
              View Details
              <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
