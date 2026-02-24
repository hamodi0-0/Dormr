"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  Home,
  Eye,
  EyeOff,
  Calendar,
  BadgePoundSterling,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Listing, ListingStatus } from "@/lib/types/listing";
import {
  ROOM_TYPE_LABELS,
  BILLING_PERIOD_SUFFIX,
  getCoverImageUrl,
  getAmenityLabels,
} from "@/lib/types/listing";
import { useDeleteListingMutation } from "@/hooks/use-delete-listing-mutation";
import { useUpdateListingMutation } from "@/hooks/use-update-listing-mutation";

interface ListerListingCardProps {
  listing: Listing;
}

export function ListerListingCard({ listing }: ListerListingCardProps) {
  const coverUrl = getCoverImageUrl(listing);
  const amenities = getAmenityLabels(listing);
  const isActive = listing.status === "active";
  const isDraft = listing.status === "draft";

  const deleteMutation = useDeleteListingMutation();
  const updateMutation = useUpdateListingMutation();

  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleToggleStatus = () => {
    setIsTogglingStatus(true);
    // draft → active, active → paused, paused → active
    const newStatus: ListingStatus = isActive ? "paused" : "active";

    updateMutation.mutate(
      {
        id: listing.id,
        updates: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(
            newStatus === "active"
              ? "Listing is now active"
              : "Listing is now paused",
          );
          setIsTogglingStatus(false);
        },
        onError: () => {
          toast.error("Failed to update listing status");
          setIsTogglingStatus(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(listing.id, {
      onSuccess: () => toast.success("Listing archived"),
      onError: () => toast.error("Failed to archive listing"),
    });
  };

  const availableDate = new Date(listing.available_from).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const priceSuffix = BILLING_PERIOD_SUFFIX[listing.billing_period] ?? "/mo";

  const statusBadge = () => {
    if (isActive)
      return (
        <Badge className="bg-emerald-500/90 text-white hover:bg-emerald-500 text-xs font-semibold">
          Active
        </Badge>
      );
    if (isDraft)
      return (
        <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 text-xs font-semibold">
          Draft
        </Badge>
      );
    return (
      <Badge className="bg-muted/90 text-muted-foreground hover:bg-muted text-xs font-semibold">
        Paused
      </Badge>
    );
  };

  return (
    <Card className="group py-0 gap-0 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
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

        {/* Status badge */}
        <div className="absolute top-3 left-3">{statusBadge()}</div>

        {/* Image count */}
        {listing.listing_images && listing.listing_images.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {listing.listing_images.length} photo
            {listing.listing_images.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title & room type */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
              {listing.title}
            </h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {ROOM_TYPE_LABELS[listing.room_type]}
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {listing.city}, {listing.country}
            </span>
          </div>
        </div>

        {/* Price & availability */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BadgePoundSterling className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground text-sm">
              £{listing.price_per_month.toLocaleString()}
            </span>
            <span>{priceSuffix}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>From {availableDate}</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button asChild size="sm" className="flex-1 h-8 text-xs gap-1.5">
            <Link href={`/lister/listings/${listing.id}/edit`}>
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleToggleStatus}
            disabled={isTogglingStatus || updateMutation.isPending || isDraft}
            aria-label={isActive ? "Pause listing" : "Activate listing"}
            title={
              isDraft
                ? "Publish the listing first to toggle visibility"
                : undefined
            }
          >
            {isTogglingStatus ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isActive ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">
              {isActive ? "Pause" : "Activate"}
            </span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                )}
                disabled={deleteMutation.isPending}
                aria-label="Archive listing"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{listing.title}&quot; will be archived and hidden from
                  students. You can contact support to restore it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
