"use client";

import { useMemo } from "react";
import { calculateCollectiveCompatibility } from "@/lib/compatibilityCalc";
import type {
  TenantCompatibilityProfile,
  CompatibilityResult,
} from "@/lib/types/compatibility";

/**
 * Memoised wrapper so the listing card never re-runs the calculation
 * unless the viewer profile or tenant list actually changes.
 */
export function useCompatibility(
  viewerProfile: TenantCompatibilityProfile | null,
  tenants: TenantCompatibilityProfile[],
): CompatibilityResult | null {
  return useMemo(() => {
    if (!viewerProfile || tenants.length === 0) return null;
    return calculateCollectiveCompatibility(viewerProfile, tenants);
  }, [viewerProfile, tenants]);
}
