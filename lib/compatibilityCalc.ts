import type {
  TenantCompatibilityProfile,
  CompatibilityResult,
  CompatibilityDetails,
  CleanlinessScore,
} from "./types/compatibility";

export const COMPATIBILITY_WEIGHTS = {
  sleep_schedule: 20,
  cleanliness: 20,
  noise_level: 15,
  guests_frequency: 10,
  smoking: 15,
  pets: 15,
  major: 5,
  hobbies: 10,
} as const;

export const MAX_SCORE_PER_TENANT = Object.values(COMPATIBILITY_WEIGHTS).reduce(
  (sum, value) => sum + value,
  0,
);

export function normalizeCompatibilityPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function scoreToPercentage(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0)
    return 0;
  return normalizeCompatibilityPercentage((score / maxScore) * 100);
}

function emptyFactorMatch(total: number) {
  return { matches: 0, total, compatible: [] as number[] };
}

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
      tenantScore += COMPATIBILITY_WEIGHTS.sleep_schedule;
      details.sleep_schedule.matches++;
      details.sleep_schedule.compatible.push(idx);
    } else if (
      viewer.sleep_schedule === "flexible" ||
      t.sleep_schedule === "flexible"
    ) {
      tenantScore += COMPATIBILITY_WEIGHTS.sleep_schedule / 2;
    }

    // ── Cleanliness (20 pts) ──────────────────────────────────────
    const diff = Math.abs(viewer.cleanliness - t.cleanliness);
    const cleanScore = Math.max(
      0,
      COMPATIBILITY_WEIGHTS.cleanliness - diff * 5,
    );
    tenantScore += cleanScore;
    details.cleanliness.scores.push({
      tenantIndex: idx,
      diff,
      score: cleanScore,
    });

    // ── Noise Level (15 pts) ──────────────────────────────────────
    if (viewer.noise_level === t.noise_level) {
      tenantScore += COMPATIBILITY_WEIGHTS.noise_level;
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
      tenantScore += COMPATIBILITY_WEIGHTS.guests_frequency;
      details.guests_frequency.matches++;
      details.guests_frequency.compatible.push(idx);
    } else {
      tenantScore += COMPATIBILITY_WEIGHTS.guests_frequency / 2; // partial credit — always some tolerance
    }

    // ── Smoking (15 pts — deal-breaker) ───────────────────────────
    if (viewer.smoking === t.smoking) {
      tenantScore += COMPATIBILITY_WEIGHTS.smoking;
      details.smoking.matches++;
      details.smoking.compatible.push(idx);
    }

    // ── Pets (15 pts — deal-breaker) ──────────────────────────────
    if (viewer.pets === t.pets) {
      tenantScore += COMPATIBILITY_WEIGHTS.pets;
      details.pets.matches++;
      details.pets.compatible.push(idx);
    }

    // ── Major (5 pts) ─────────────────────────────────────────────
    if (viewer.major && t.major && viewer.major === t.major) {
      tenantScore += COMPATIBILITY_WEIGHTS.major;
      details.major.matches++;
      details.major.compatible.push(idx);
    }

    // ── Shared Hobbies (10 pts, capped) ──────────────────────────
    const tenantHobbies = t.hobbies ?? [];
    const shared = viewerHobbies.filter((h) => tenantHobbies.includes(h));
    const hobbyScore = Math.min(
      COMPATIBILITY_WEIGHTS.hobbies,
      shared.length * 3,
    );
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
      score: scoreToPercentage(tenantScore, MAX_SCORE_PER_TENANT),
    });
  }

  // Finalise details
  const totalDiff = details.cleanliness.scores.reduce((s, r) => s + r.diff, 0);
  details.cleanliness.averageDiff = total > 0 ? totalDiff / total : 0;
  details.hobbies.totalShared = details.hobbies.shared.length;

  const maxPossibleScore = total * MAX_SCORE_PER_TENANT;
  const overallScore = scoreToPercentage(totalScore, maxPossibleScore);

  return {
    overallScore,
    details,
    tenantMatches: tenantMatches.sort((a, b) => b.score - a.score),
  };
}

/** Colour tier helpers — used by both badge and section. */
export function getScoreTier(score: number): "green" | "amber" | "red" {
  const normalized = normalizeCompatibilityPercentage(score);
  if (normalized >= 75) return "green";
  if (normalized >= 50) return "amber";
  return "red";
}

export function getScoreLabel(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "green") return "Great match";
  if (tier === "amber") return "Decent match";
  return "Low match";
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
