"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search, Home, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ListerListingCard } from "@/components/lister/lister-listing-card";
import { useListerListings } from "@/hooks/use-lister-listings";
import type { Listing, ListingStatus } from "@/lib/types/listing";

interface MyListingsClientProps {
  initialListings: Listing[];
}

type StatusFilter = "all" | ListingStatus;

export function MyListingsClient({ initialListings }: MyListingsClientProps) {
  const { data: listings = [] } = useListerListings(initialListings);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = listings.filter((l) => {
    const matchesSearch =
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
            My Listings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild className="gap-2 self-start sm:self-auto">
          <Link href="/lister/listings/new">
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      {listings.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-auto min-w-37.5">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All listings</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {listings.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-medium text-foreground">
                No listings yet
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create your first listing to start connecting with students
                looking for accommodation.
              </p>
            </div>
            <Button asChild className="gap-2 mt-2">
              <Link href="/lister/listings/new">
                <Plus className="h-4 w-4" />
                Create Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No listings match</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <ListerListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
