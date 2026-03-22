interface GeoCoords {
  lat: number;
  lng: number;
}

export interface ReverseGeoResult {
  street?: string;
  city?: string;
  country?: string;
}

/**
 * Geocodes an address string to lat/lng using Nominatim (OpenStreetMap).
 * Free, no API key required.
 *
 * Returns null on failure — callers should silently swallow null and
 * save the listing without coordinates rather than blocking submission.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeoCoords | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim requires a descriptive User-Agent
        "User-Agent": "Dormr/1.0 (roommate-finder-app)",
      },
    });

    if (!res.ok) return null;

    const results: Array<{ lat: string; lon: string }> = await res.json();

    if (!results.length) return null;

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch {
    // Network errors, parse errors — all treated as soft failures
    return null;
  }
}

/**
 * Reverse geocodes lat/lng to address components using Nominatim.
 * Extracts street address, city, and country from the response.
 *
 * Returns null on failure — callers should handle gracefully.
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number,
): Promise<ReverseGeoResult | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lng.toString());
    url.searchParams.set("format", "json");
    url.searchParams.set("zoom", "18");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Dormr/1.0 (roommate-finder-app)",
      },
    });

    if (!res.ok) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await res.json();

    if (!result.address) return null;

    const { address } = result;

    // Extract relevant fields from Nominatim's address object
    const street =
      address.house_number && address.road
        ? `${address.house_number} ${address.road}`
        : address.road || undefined;

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      undefined;

    const country = address.country || undefined;

    return {
      street: street || undefined,
      city,
      country,
    };
  } catch {
    return null;
  }
}
