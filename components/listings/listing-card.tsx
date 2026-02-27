"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MapPin,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Home,
  Clock,
  ChevronLeft,
  ChevronRight,
  Camera,
  Eye,
  Heart,
  Calendar,
  ArrowLeft,
  ArrowRightCircle,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types/listing";
import { ROOM_TYPE_LABELS, BILLING_PERIOD_SUFFIX } from "@/lib/types/listing";
import type { ListingImage } from "@/lib/types/listing";

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

interface ImageCarouselProps {
  images: ListingImage[];
  listingId: string;
  title: string;
}

function ImageCarousel({ images, listingId, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sorted = [...images].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.position - b.position;
  });

  const goToPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((i) => (i - 1 + sorted.length) % sorted.length);
    },
    [sorted.length],
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((i) => (i + 1) % sorted.length);
    },
    [sorted.length],
  );

  const goToDot = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  }, []);

  if (sorted.length === 0) {
    return (
      <Link href={`/dashboard/listings/${listingId}`} className="block h-full">
        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
          <Home className="h-10 w-10 text-muted-foreground/20" />
        </div>
      </Link>
    );
  }

  return (
    <div className="relative w-full h-full group/carousel overflow-hidden">
      {/* Images */}
      <Link href={`/dashboard/listings/${listingId}`} className="block h-full">
        <div className="relative w-full h-full">
          {sorted.map((img, idx) => (
            <div
              key={img.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-300",
                idx === currentIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none",
              )}
            >
              <Image
                src={img.public_url}
                alt={`${title} - photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 320px"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </Link>

      {/* Prev / Next arrows — only visible on hover */}
      {sorted.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            aria-label="Previous photo"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200",
              "hover:bg-black/70",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next photo"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center",
              "opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200",
              "hover:bg-black/70",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Photo count badge */}
      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
        <Camera className="h-3 w-3" />
        <span>{sorted.length}</span>
      </div>

      {/* Dot indicators */}
      {sorted.length > 1 && sorted.length <= 8 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {sorted.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goToDot(e, idx)}
              aria-label={`Go to photo ${idx + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                idx === currentIndex
                  ? "w-2 h-2 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/75",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function ListingCard({ listing, className }: ListingCardProps) {
  const images = listing.listing_images ?? [];
  const priceSuffix = BILLING_PERIOD_SUFFIX[listing.billing_period] ?? "/mo";
  const postedAgo = formatDistanceToNow(new Date(listing.created_at), {
    addSuffix: true,
  });
  const roomTypeLabel = ROOM_TYPE_LABELS[listing.room_type];
  const locationParts = [listing.address_line, listing.city]
    .filter(Boolean)
    .join(", ");

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "bg-card border border-border rounded-xl overflow-hidden",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "flex flex-col",
          className,
        )}
      >
        {/* ── Card body: image + content ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-72 lg:w-80 xl:w-88 shrink-0 h-52 sm:h-56 bg-muted">
            <ImageCarousel
              images={images}
              listingId={listing.id}
              title={listing.title}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 min-w-0">
            {/* Top row: room type badge */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {roomTypeLabel}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
                £{listing.price_per_month.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {priceSuffix}
              </span>
            </div>

            {/* Title */}
            <Link
              href={`/dashboard/listings/${listing.id}`}
              className="group/title"
            >
              <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover/title:text-primary transition-colors leading-snug line-clamp-2">
                {listing.title}
              </h3>
            </Link>

            {/* Location */}
            <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/70" />
              <span className="line-clamp-1">{locationParts}</span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                <span>{listing.max_occupants}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Home className="h-4 w-4 shrink-0" />
                <span>{roomTypeLabel}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{listing.min_stay_months}mo min</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer: posted time + action buttons ───────────────────────── */}
        <div className="border-t border-border/60 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 bg-muted/30">
          {/* Listed time */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            <span>Listed {postedAgo}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  disabled
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Contact coming soon</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  disabled
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Contact coming soon</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  disabled
                >
                  <Heart className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save listing (coming soon)</TooltipContent>
            </Tooltip>

            <Link href={`/dashboard/listings/${listing.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
              >
                <span>Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
