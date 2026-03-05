import type {
  TenantCompatibilityProfile,
  CompatibilityResult,
  CompatibilityDetails,
  CleanlinessScore,
} from "./types/compatibility";

// Max points per tenant — constant, so we never recompute it
const MAX_SCORE_PER_TENANT = 110;

function emptyFactorMatch(total: number) {
  return { matches: 0, total, compatible: [] as number[] };
}

/**
 * Pure function — no side effects, no I/O.
 * O(T × 8) where T = number of tenants.
 *
 * Optimisation: if T === 1, overallScore === tenantMatches[0].score
 * by definition (totalScore / 110 === tenantScore / 110), so no
 * special-casing is needed — the loop naturally produces the same result.
 */
export function calculateCollectiveCompatibility(
  viewer: TenantCompatibilityProfile,
  tenants: TenantCompatibilityProfile[],
): CompatibilityResult {
  const total = tenants.length;

  const details: CompatibilityDetails = {
    sleep_schedule: emptyFactorMatch(total),
    cleanliness: { averageDiff: 0, scores: [] as CleanlinessScore[] },
    noise_level: emptyFactorMatch(total),
    guests_frequency: emptyFactorMatch(total),
    smoking: emptyFactorMatch(total),
    pets: emptyFactorMatch(total),
    major: emptyFactorMatch(total),
    hobbies: { shared: [], totalShared: 0 },
  };

  const tenantMatches: CompatibilityResult["tenantMatches"] = [];
  let totalScore = 0;

  const viewerHobbies = viewer.hobbies ?? [];

  for (let i = 0; i < tenants.length; i++) {
    const t = tenants[i];
    const idx = i + 1; // 1-based for display
    let tenantScore = 0;

    // ── Sleep Schedule (20 pts) ───────────────────────────────────
    if (viewer.sleep_schedule === t.sleep_schedule) {
      tenantScore += 20;
      details.sleep_schedule.matches++;
      details.sleep_schedule.compatible.push(idx);
    } else if (
      viewer.sleep_schedule === "flexible" ||
      t.sleep_schedule === "flexible"
    ) {
      tenantScore += 10;
    }

    // ── Cleanliness (20 pts) ──────────────────────────────────────
    const diff = Math.abs(viewer.cleanliness - t.cleanliness);
    const cleanScore = Math.max(0, 20 - diff * 5);
    tenantScore += cleanScore;
    details.cleanliness.scores.push({
      tenantIndex: idx,
      diff,
      score: cleanScore,
    });

    // ── Noise Level (15 pts) ──────────────────────────────────────
    if (viewer.noise_level === t.noise_level) {
      tenantScore += 15;
      details.noise_level.matches++;
      details.noise_level.compatible.push(idx);
    } else if (
      viewer.noise_level === "moderate" ||
      t.noise_level === "moderate"
    ) {
      tenantScore += 7;
    }

    // ── Guests Frequency (10 pts) ─────────────────────────────────
    if (viewer.guests_frequency === t.guests_frequency) {
      tenantScore += 10;
      details.guests_frequency.matches++;
      details.guests_frequency.compatible.push(idx);
    } else {
      tenantScore += 5; // partial credit — always some tolerance
    }

    // ── Smoking (15 pts — deal-breaker) ───────────────────────────
    if (viewer.smoking === t.smoking) {
      tenantScore += 15;
      details.smoking.matches++;
      details.smoking.compatible.push(idx);
    }

    // ── Pets (15 pts — deal-breaker) ──────────────────────────────
    if (viewer.pets === t.pets) {
      tenantScore += 15;
      details.pets.matches++;
      details.pets.compatible.push(idx);
    }

    // ── Major (5 pts) ─────────────────────────────────────────────
    if (viewer.major && t.major && viewer.major === t.major) {
      tenantScore += 5;
      details.major.matches++;
      details.major.compatible.push(idx);
    }

    // ── Shared Hobbies (10 pts, capped) ──────────────────────────
    const tenantHobbies = t.hobbies ?? [];
    const shared = viewerHobbies.filter((h) => tenantHobbies.includes(h));
    const hobbyScore = Math.min(10, shared.length * 3);
    tenantScore += hobbyScore;

    // Accumulate unique shared hobbies across all tenants
    for (const h of shared) {
      if (!details.hobbies.shared.includes(h)) {
        details.hobbies.shared.push(h);
      }
    }

    totalScore += tenantScore;
    tenantMatches.push({
      tenantIndex: idx,
      score: Math.round((tenantScore / MAX_SCORE_PER_TENANT) * 100),
    });
  }

  // Finalise details
  const totalDiff = details.cleanliness.scores.reduce((s, r) => s + r.diff, 0);
  details.cleanliness.averageDiff = total > 0 ? totalDiff / total : 0;
  details.hobbies.totalShared = details.hobbies.shared.length;

  const maxPossibleScore = total * MAX_SCORE_PER_TENANT;
  const overallScore =
    maxPossibleScore > 0
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 0;

  return {
    overallScore,
    details,
    tenantMatches: tenantMatches.sort((a, b) => b.score - a.score),
  };
}

/** Colour tier helpers — used by both badge and section. */
export function getScoreTier(score: number): "green" | "amber" | "red" {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "red";
}

export const SCORE_TIER_CLASSES = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    bar: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    bar: "bg-amber-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    bar: "bg-red-500",
  },
} as const;
