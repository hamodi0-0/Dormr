"use client";

import { useState, useCallback } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Loader2,
  Upload,
  X,
  ImageIcon,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  createListingSchema,
  type CreateListingValues,
} from "@/lib/schemas/listing-schema";
import { geocodeAddress } from "@/lib/geocoding";
import { useCreateListingMutation } from "@/hooks/use-create-listing-mutation";
import { useUpdateListingMutation } from "@/hooks/use-update-listing-mutation";
import { createClient } from "@/lib/supabase/client";
import type { Listing, ListingImage, BillingPeriod } from "@/lib/types/listing";
import { BILLING_PERIOD_LABELS } from "@/lib/types/listing";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Dynamic Leaflet import (no SSR) ─────────────────────────────────────────

const LocationPickerMap = dynamic(
  () =>
    import("@/components/listings/location-picker-map").then(
      (m) => m.LocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted animate-pulse rounded-md flex items-center justify-center">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
      </div>
    ),
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingFormProps {
  mode: "create" | "edit";
  listing?: Listing;
}

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITIES = [
  { name: "wifi" as const, label: "WiFi" },
  { name: "parking" as const, label: "Parking" },
  { name: "laundry" as const, label: "Laundry" },
  { name: "gym" as const, label: "Gym" },
  { name: "bills_included" as const, label: "Bills Included" },
  { name: "furnished" as const, label: "Furnished" },
] satisfies { name: keyof CreateListingValues; label: string }[];

const ROOM_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "single", label: "Single Room" },
  { value: "shared", label: "Shared Room" },
  { value: "studio", label: "Studio" },
  { value: "entire_apartment", label: "Entire Apartment" },
];

const GENDER_PREF_OPTIONS: { value: string; label: string }[] = [
  { value: "male_only", label: "Male Only" },
  { value: "female_only", label: "Female Only" },
  { value: "mixed", label: "Mixed" },
  { value: "no_preference", label: "No Preference" },
];

const BILLING_PERIOD_OPTIONS = Object.entries(BILLING_PERIOD_LABELS).map(
  ([value, label]) => ({ value: value as BillingPeriod, label }),
);

// ─── Image Helpers ────────────────────────────────────────────────────────────

async function uploadImageToStorage(
  supabase: ReturnType<typeof createClient>,
  file: File,
  userId: string,
  listingId: string,
  position: number,
  isCover: boolean,
): Promise<void> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${userId}/${listingId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("listing-images")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("listing-images")
    .getPublicUrl(storagePath);

  const { error: dbError } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    position,
    is_cover: isCover,
  });

  if (dbError) throw dbError;
}

async function removeImageFromStorage(
  supabase: ReturnType<typeof createClient>,
  image: ListingImage,
): Promise<void> {
  await supabase.storage.from("listing-images").remove([image.storage_path]);
  const { error } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", image.id);
  if (error) throw error;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const createMutation = useCreateListingMutation();
  const updateMutation = useUpdateListingMutation();

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [existingImages, setExistingImages] = useState<ListingImage[]>(
    listing?.listing_images ?? [],
  );
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || isUploadingImages;

  // ─── Form ─────────────────────────────────────────────────────────────────

  const form = useForm<CreateListingValues>({
    resolver: zodResolver(createListingSchema) as Resolver<CreateListingValues>,
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description ?? "",
          room_type: listing.room_type,
          price_per_month: listing.price_per_month,
          billing_period: listing.billing_period,
          available_from: listing.available_from,
          min_stay_months: listing.min_stay_months,
          max_occupants: listing.max_occupants,
          address_line: listing.address_line,
          city: listing.city,
          postcode: listing.postcode ?? "",
          country: listing.country,
          gender_preference: listing.gender_preference,
          university_name: listing.university_name ?? "",
          wifi: listing.wifi,
          parking: listing.parking,
          laundry: listing.laundry,
          gym: listing.gym,
          bills_included: listing.bills_included,
          furnished: listing.furnished,
          latitude: listing.latitude ?? undefined,
          longitude: listing.longitude ?? undefined,
        }
      : {
          title: "",
          description: "",
          room_type: undefined,
          price_per_month: undefined,
          billing_period: "monthly",
          available_from: "",
          min_stay_months: 1,
          max_occupants: 1,
          address_line: "",
          city: "",
          postcode: "",
          country: "United Kingdom",
          gender_preference: "no_preference",
          university_name: "",
          wifi: false,
          parking: false,
          laundry: false,
          gym: false,
          bills_included: false,
          furnished: true,
        },
  });

  // Watch lat/lng so the map reacts to geocoding results
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  const hasCoords =
    latitude != null &&
    longitude != null &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // ─── Geocode on address blur ──────────────────────────────────────────────

  const handleAddressBlur = useCallback(async () => {
    const { address_line, city, postcode } = form.getValues();
    const query = [address_line, city, postcode].filter(Boolean).join(", ");
    if (query.length < 5) return;

    setIsGeocodingAddress(true);
    setGeocodeStatus("idle");

    try {
      const coords = await geocodeAddress(query);
      if (coords) {
        form.setValue("latitude", coords.lat);
        form.setValue("longitude", coords.lng);
        setGeocodeStatus("success");
      } else {
        setGeocodeStatus("failed");
      }
    } catch {
      setGeocodeStatus("failed");
    } finally {
      setIsGeocodingAddress(false);
    }
  }, [form]);

  // ─── Map location change (click / drag) ──────────────────────────────────

  const handleMapLocationChange = useCallback(
    (lat: number, lng: number) => {
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);
      setGeocodeStatus("success");
    },
    [form],
  );

  // ─── Image Handlers ───────────────────────────────────────────────────────

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const validFiles = files.filter((f) => f.type.startsWith("image/"));
      const previews: PendingImage[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setPendingImages((prev) => [...prev, ...previews]);
      e.target.value = "";
    },
    [],
  );

  const removePendingImage = useCallback((imageId: string) => {
    setPendingImages((prev) => {
      const target = prev.find((img) => img.id === imageId);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== imageId);
    });
  }, []);

  const handleDeleteExistingImage = useCallback(async (image: ListingImage) => {
    const supabase = createClient();
    setDeletingImageId(image.id);
    try {
      await removeImageFromStorage(supabase, image);
      setExistingImages((prev) => prev.filter((i) => i.id !== image.id));
      toast.success("Photo removed");
    } catch {
      toast.error("Failed to remove photo. Please try again.");
    } finally {
      setDeletingImageId(null);
    }
  }, []);

  // ─── Upload Images Helper ─────────────────────────────────────────────────

  const uploadPendingImages = async (
    listingId: string,
    startPosition: number,
    firstIsCover: boolean,
  ) => {
    if (pendingImages.length === 0) return;
    setIsUploadingImages(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsUploadingImages(false);
      return;
    }
    try {
      for (let i = 0; i < pendingImages.length; i++) {
        await uploadImageToStorage(
          supabase,
          pendingImages[i].file,
          user.id,
          listingId,
          startPosition + i,
          firstIsCover && i === 0,
        );
      }
    } catch {
      toast.error(
        "Listing saved, but some photos failed to upload. You can add them by editing the listing.",
      );
    } finally {
      setIsUploadingImages(false);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const onSubmit = async (values: CreateListingValues) => {
    // Geocode silently on submit if no coords yet
    if (!values.latitude || !values.longitude) {
      try {
        const query = [values.address_line, values.city, values.postcode]
          .filter(Boolean)
          .join(", ");
        const coords = await geocodeAddress(query);
        if (coords) {
          values.latitude = coords.lat;
          values.longitude = coords.lng;
        }
      } catch {
        // intentionally swallowed
      }
    }

    const normalised = {
      ...values,
      description: values.description || undefined,
      university_name: values.university_name || undefined,
      postcode: values.postcode || undefined,
    };

    if (mode === "create") {
      createMutation.mutate(normalised, {
        onSuccess: async (newListing) => {
          await uploadPendingImages(newListing.id, 0, true);
          toast.success("Listing created!");
          router.push("/lister/listings");
        },
        onError: (error) => {
          toast.error(
            error.message ?? "Failed to create listing. Please try again.",
          );
        },
      });
    } else {
      if (!listing) return;
      updateMutation.mutate(
        { id: listing.id, updates: normalised },
        {
          onSuccess: async () => {
            await uploadPendingImages(
              listing.id,
              existingImages.length,
              existingImages.length === 0,
            );
            toast.success("Listing updated!");
            router.push("/lister/listings");
          },
          onError: (error) => {
            toast.error(
              error.message ?? "Failed to update listing. Please try again.",
            );
          },
        },
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── 1. Basic Info ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bright en-suite near University of Manchester"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="text-xs text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the room, house rules, what's nearby…"
                      className="min-h-25 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROOM_TYPE_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="price_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="650"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billing_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billed</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BILLING_PERIOD_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="available_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stay_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stay (months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_occupants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Occupants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Location ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address_line"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 12 Oak Street"
                      {...field}
                      onBlur={handleAddressBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Manchester"
                        {...field}
                        onBlur={handleAddressBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Postcode{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="M1 1AE"
                        {...field}
                        onBlur={handleAddressBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United Kingdom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Location Pin Status ── */}
            <div className="flex items-center gap-2 text-xs">
              {isGeocodingAddress ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Finding location…
                  </span>
                </>
              ) : geocodeStatus === "success" && hasCoords ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Location pinned — drag the marker or click to adjust
                  </span>
                </>
              ) : geocodeStatus === "failed" ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Address not found — click the map to pin manually
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Enter your address above or click the map to pin the exact
                    location
                  </span>
                </>
              )}
            </div>

            {/* ── Interactive Map Picker ── */}
            <div className="h-72 w-full rounded-lg overflow-hidden border border-border">
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleMapLocationChange}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Only the general area is shown publicly — your exact pin is used
              for the detail page map.
            </p>
          </CardContent>
        </Card>

        {/* ── 3. Preferences ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenant Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="gender_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Preference</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_PREF_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="university_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target University{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. University of Manchester"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Amenities ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AMENITIES.map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2.5 space-y-0 rounded-md border px-3 py-2.5">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-normal leading-none">
                        {label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── 5. Photos ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Current photos</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                    >
                      <Image
                        src={img.public_url}
                        alt="Listing photo"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 33vw, 20vw"
                      />
                      {img.is_cover && (
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={deletingImageId === img.id}
                        onClick={() => handleDeleteExistingImage(img)}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {deletingImageId === img.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {existingImages.length > 0
                    ? "New photos to add"
                    : "Selected photos"}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {pendingImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-md border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt="Photo preview"
                        className="h-full w-full object-cover"
                      />
                      {existingImages.length === 0 && index === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePendingImage(img.id)}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-8 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground">
              <Upload className="h-6 w-6 transition-transform group-hover:scale-105" />
              <span className="text-sm font-medium">
                {pendingImages.length === 0 && existingImages.length === 0
                  ? "Click to add photos"
                  : "Add more photos"}
              </span>
              <span className="text-xs">JPEG, PNG, WebP · up to 5 MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            {pendingImages.length === 0 && existingImages.length === 0 && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                The first photo you upload will be used as the cover image.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/lister/listings")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Listing" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
