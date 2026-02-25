"use client";

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
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types/listing";
import {
  ROOM_TYPE_LABELS,
  BILLING_PERIOD_SUFFIX,
  getCoverImageUrl,
} from "@/lib/types/listing";

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const coverUrl = getCoverImageUrl(listing);
  const priceSuffix = BILLING_PERIOD_SUFFIX[listing.billing_period] ?? "/mo";
  const postedAgo = formatDistanceToNow(new Date(listing.created_at), {
    addSuffix: true,
  });
  const roomTypeLabel = ROOM_TYPE_LABELS[listing.room_type];

  const locationParts = [
    listing.city,
    listing.country !== "United Kingdom" ? listing.country : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      className={cn(
        "group overflow-hidden py-0 gap-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {/* ── Cover Photo ─────────────────────────────────────────────────── */}
      <Link
        href={`/dashboard/listings/${listing.id}`}
        className="block relative h-44 bg-muted overflow-hidden"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/30">
            <Home className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Room type badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium shadow-sm"
        >
          {roomTypeLabel}
        </Badge>
      </Link>

      <CardContent className="p-4 space-y-3">
        {/* ── Price ───────────────────────────────────────────────────────── */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-foreground">
            £{listing.price_per_month.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">{priceSuffix}</span>
        </div>

        {/* ── Title ───────────────────────────────────────────────────────── */}
        <Link href={`/dashboard/listings/${listing.id}`} className="block">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        {/* ── Location ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationParts}</span>
        </div>

        {/* ── Property Stats ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>Up to {listing.max_occupants}</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span>{roomTypeLabel}</span>
          </div>
        </div>

        {/* ── Action Buttons ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 opacity-50 cursor-not-allowed"
            disabled
            title="Contact features coming soon"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 opacity-50 cursor-not-allowed"
            disabled
            title="Contact features coming soon"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 opacity-50 cursor-not-allowed"
            disabled
            title="Contact features coming soon"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat
          </Button>
        </div>

        {/* ── Metadata footer ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 border-t border-border/40 pt-2.5">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Posted {postedAgo}</span>
          </div>
          <Link
            href={`/dashboard/listings/${listing.id}`}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Eye className="h-3 w-3" />
            <span>View details</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
