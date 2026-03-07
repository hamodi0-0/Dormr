"use client";

import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentProfile } from "@/hooks/use-student-profile";
import {
  usePublicListingsPage,
  PAGE_SIZE,
} from "@/hooks/use-public-listings-page";
import type { ListingsPageResult } from "@/hooks/use-public-listings-page";
import { ListingCard } from "@/components/listings/listing-card";
import { useDebounce } from "@/hooks/use-debounce";
import { useListingFilters } from "@/lib/stores/listing-filters-store";
import { cn } from "@/lib/utils";
import type { GenderPreference, RoomType } from "@/lib/types/listing";

interface ListingsGridClientProps {
  initialData: ListingsPageResult;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden flex h-[170px]">
      <Skeleton className="w-[240px] shrink-0 h-full" />
      <div className="flex-1 p-4 space-y-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function PaginationControls({
  page,
  totalCount,
  isPlaceholder,
  onPageChange,
}: {
  page: number;
  totalCount: number;
  isPlaceholder: boolean;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1 || isPlaceholder}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
          if (!show) {
            if (p === 2 || p === totalPages - 1) {
              return (
                <span key={p} className="text-muted-foreground text-sm px-1">
                  …
                </span>
              );
            }
            return null;
          }
          return (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="w-9 h-9"
              disabled={isPlaceholder}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages || isPlaceholder}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function ListingsGridClient({ initialData }: ListingsGridClientProps) {
  const [page, setPage] = useState(1);

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

  const debouncedSearch = useDebounce(searchQuery, 350);

  const filters = {
    search: debouncedSearch,
    roomType,
    maxPrice,
    genderPreference,
  };

  const { data, isFetching, isPlaceholderData } = usePublicListingsPage(
    page,
    filters,
    initialData,
  );

  const { data: viewerProfile } = useStudentProfile();

  const listings = data?.listings ?? [];
  const tenantProfiles = data?.tenantProfiles ?? {};
  const totalCount = data?.totalCount ?? 0;

  function handleFilterChange(next: {
    roomType?: RoomType | null;
    maxPrice?: number | null;
    genderPreference?: GenderPreference | null;
  }) {
    if ("roomType" in next) setRoomType(next.roomType ?? null);
    if ("maxPrice" in next) setMaxPrice(next.maxPrice ?? null);
    if ("genderPreference" in next)
      setGenderPreference(next.genderPreference ?? null);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function handleReset() {
    resetFilters();
    setPage(1);
  }

  const hasActiveFilters =
    !!searchQuery || !!roomType || maxPrice !== null || !!genderPreference;

  const activeFilterCount = [
    searchQuery,
    roomType,
    maxPrice !== null ? true : false,
    genderPreference,
  ].filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Sticky filter bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/97 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by city, area, university, or keyword…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-10 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-border shrink-0" />

            <Select
              value={roomType ?? "all"}
              onValueChange={(v) =>
                handleFilterChange({
                  roomType: v === "all" ? null : (v as RoomType),
                })
              }
            >
              <SelectTrigger className="h-10 text-sm w-auto min-w-[140px] shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Types" />
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
                handleFilterChange({ maxPrice: v === "any" ? null : Number(v) })
              }
            >
              <SelectTrigger className="h-10 text-sm w-auto min-w-[130px] shrink-0">
                <SelectValue placeholder="Any Price" />
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
                handleFilterChange({
                  genderPreference:
                    v === "any" ? null : (v as GenderPreference),
                })
              }
            >
              <SelectTrigger className="h-10 text-sm w-auto min-w-[140px] shrink-0">
                <SelectValue placeholder="Any Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Preference</SelectItem>
                <SelectItem value="no_preference">No Preference</SelectItem>
                <SelectItem value="male_only">Male Only</SelectItem>
                <SelectItem value="female_only">Female Only</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-10 text-sm text-muted-foreground hover:text-foreground gap-1 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                {totalCount === 1 ? "property" : "properties"}
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs h-5">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-2 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search city, area, university…"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={roomType ?? "all"}
                onValueChange={(v) =>
                  handleFilterChange({
                    roomType: v === "all" ? null : (v as RoomType),
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[110px]">
                  <SlidersHorizontal className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="entire_apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={maxPrice !== null ? String(maxPrice) : "any"}
                onValueChange={(v) =>
                  handleFilterChange({
                    maxPrice: v === "any" ? null : Number(v),
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[100px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="500">≤ £500</SelectItem>
                  <SelectItem value="750">≤ £750</SelectItem>
                  <SelectItem value="1000">≤ £1,000</SelectItem>
                  <SelectItem value="1500">≤ £1,500</SelectItem>
                  <SelectItem value="2000">≤ £2,000</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={genderPreference ?? "any"}
                onValueChange={(v) =>
                  handleFilterChange({
                    genderPreference:
                      v === "any" ? null : (v as GenderPreference),
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[100px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="no_preference">No Pref.</SelectItem>
                  <SelectItem value="male_only">Male Only</SelectItem>
                  <SelectItem value="female_only">Female Only</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  <span className="font-semibold text-foreground">
                    {totalCount}
                  </span>{" "}
                  {totalCount === 1 ? "place" : "places"}
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
          Browse Listings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find your ideal student housing match
        </p>
      </div>

      {/* ── Listings ───────────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 sm:px-6 py-5 max-w-5xl mx-auto w-full mb-20">
        <div
          className={cn(
            "transition-opacity duration-150",
            isPlaceholderData && "opacity-60",
          )}
        >
          {isFetching && listings.length === 0 ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card className="py-20 text-center mt-4">
              <CardContent className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">
                  No listings match your filters
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Try adjusting your filters or broadening your search
                </p>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  tenantProfiles={tenantProfiles[listing.id] ?? []}
                  viewerProfile={viewerProfile}
                />
              ))}
            </div>
          )}
        </div>

        <PaginationControls
          page={page}
          totalCount={totalCount}
          isPlaceholder={isPlaceholderData}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
