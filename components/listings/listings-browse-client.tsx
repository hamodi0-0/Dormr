"use client";

import { useState } from "react";
import { useStudentProfile } from "@/hooks/use-student-profile";
import {
  usePublicListingsPage,
  PAGE_SIZE,
} from "@/hooks/use-public-listings-page";
import type {
  ListingFiltersQuery,
  ListingsPageResult,
} from "@/hooks/use-public-listings-page";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface ListingsGridClientProps {
  initialData: ListingsPageResult;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

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
          // Show current, first, last, and ±1 around current
          const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;

          if (!show) {
            // Show ellipsis once per gap
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

export function ListingsGridClient({ initialData }: ListingsGridClientProps) {
  const [page, setPage] = useState(1);
  const [rawFilters, setRawFilters] = useState<ListingFiltersQuery>({
    search: "",
    roomType: null,
    maxPrice: null,
    genderPreference: null,
  });

  // Debounce search so we don't fire on every keystroke
  const filters: ListingFiltersQuery = {
    ...rawFilters,
    search: useDebounce(rawFilters.search, 350),
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

  function handleFilterChange(next: Partial<ListingFiltersQuery>) {
    setRawFilters((prev) => ({ ...prev, ...next }));
    setPage(1); // reset to page 1 on filter change
  }

  return (
    <div className="space-y-6">
      <ListingsFilters filters={rawFilters} onChange={handleFilterChange} />

      {/* Subtle fade when paginating to signal transition without layout shift */}
      <div
        className={cn(
          "transition-opacity duration-150",
          isPlaceholderData && "opacity-60",
        )}
      >
        {isFetching && listings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No listings found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}
