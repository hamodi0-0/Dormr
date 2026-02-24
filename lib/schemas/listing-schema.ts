import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const createListingSchema = z.object({
  // Basic info
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  room_type: z.enum(["single", "shared", "studio", "entire_apartment"], {
    error: "Please select a room type",
  }),
  price_per_month: z.coerce
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0"),
  billing_period: z
    .enum(["weekly", "monthly", "quarterly", "semi_annually", "annually"])
    .default("monthly"),
  available_from: z.string().min(1, "Please select an availability date"),
  min_stay_months: z
    .number()
    .int()
    .min(1, "Minimum stay must be at least 1 month")
    .default(1),
  max_occupants: z
    .number()
    .int()
    .min(1, "Must allow at least 1 occupant")
    .default(1),

  // Location
  address_line: z.string().min(3, "Please enter a street address"),
  city: z.string().min(2, "Please enter a city"),
  postcode: z.string().optional(),
  country: z.string().default("United Kingdom"),

  // Geocoded coordinates — set programmatically, never shown as form fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Preferences
  gender_preference: z
    .enum(["male_only", "female_only", "mixed", "no_preference"])
    .default("no_preference"),
  university_name: z.string().optional(),

  // Amenities — flat booleans, each is a top-level column in the DB
  wifi: z.boolean().default(false),
  parking: z.boolean().default(false),
  laundry: z.boolean().default(false),
  gym: z.boolean().default(false),
  bills_included: z.boolean().default(false),
  furnished: z.boolean().default(false),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateListingValues = z.infer<typeof createListingSchema>;
