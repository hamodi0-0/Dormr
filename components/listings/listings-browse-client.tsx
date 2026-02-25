"use client";

import { useMemo } from "react";
import { Search, SlidersHorizontal, X, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/listing-card";
import { usePublicListings } from "@/hooks/use-public-listings";
import {
  useListingFilters,
  type RoomType,
} from "@/lib/stores/listing-filters-store";
import type { Listing } from "@/lib/types/listing";

interface ListingsBrowseClientProps {
  initialListings: Listing[];
}

export function ListingsBrowseClient({
  initialListings,
}: ListingsBrowseClientProps) {
  const { data: listings = [] } = usePublicListings(initialListings);

  const {
    searchQuery,
    roomType,
    maxPrice,
    genderPreference,
    setSearchQuery,
    setRoomType,
    setMaxPrice,
    setGenderPreference,
    resetFilters,
  } = useListingFilters();

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          listing.title.toLowerCase().includes(q) ||
          listing.city.toLowerCase().includes(q) ||
          (listing.university_name?.toLowerCase().includes(q) ?? false);
        if (!matches) return false;
      }

      // Room type
      if (roomType && listing.room_type !== roomType) return false;

      // Max price
      if (maxPrice !== null && listing.price_per_month > maxPrice) return false;

      // Gender preference
      if (genderPreference && listing.gender_preference !== genderPreference)
        return false;

      return true;
    });
  }, [listings, searchQuery, roomType, maxPrice, genderPreference]);

  const hasActiveFilters =
    searchQuery || roomType || maxPrice !== null || genderPreference;

  const activeFilterCount = [
    searchQuery,
    roomType,
    maxPrice !== null,
    genderPreference,
  ].filter(Boolean).length;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <Card className="mb-6 py-0">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title, city, or university…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter dropdowns row */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={roomType ?? "all"}
                onValueChange={(v) =>
                  setRoomType(v === "all" ? null : (v as RoomType))
                }
              >
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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
                value={maxPrice !== null ? String(maxPrice) : "any"}
                onValueChange={(v) =>
                  setMaxPrice(v === "any" ? null : Number(v))
                }
              >
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm">
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="500">Up to £500/mo</SelectItem>
                  <SelectItem value="750">Up to £750/mo</SelectItem>
                  <SelectItem value="1000">Up to £1,000/mo</SelectItem>
                  <SelectItem value="1500">Up to £1,500/mo</SelectItem>
                  <SelectItem value="2000">Up to £2,000/mo</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={genderPreference ?? "any"}
                onValueChange={(v) =>
                  setGenderPreference(
                    v === "any"
                      ? null
                      : (v as "male_only" | "female_only" | "no_preference"),
                  )
                }
              >
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-sm">
                  <SelectValue placeholder="Gender Pref." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Preference</SelectItem>
                  <SelectItem value="no_preference">No Preference</SelectItem>
                  <SelectItem value="male_only">Male Only</SelectItem>
                  <SelectItem value="female_only">Female Only</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-sm text-muted-foreground hover:text-foreground gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Results Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
              active
            </Badge>
          )}
        </div>
      </div>

      {/* ── Listings Grid ───────────────────────────────────────────────── */}
      {listings.length === 0 ? (
        <Card className="py-20 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Listers are adding rooms every day — check back soon!
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-20 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings match</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Try adjusting your filters or broadening your search
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
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
