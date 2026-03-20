"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  calculateCollectiveCompatibility,
  getScoreTier,
  getScoreLabel,
  normalizeCompatibilityPercentage,
  SCORE_TIER_CLASSES,
} from "@/lib/compatibilityCalc";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";

// ─── Label maps ───────────────────────────────────────────────────────────────

const SLEEP_LABELS: Record<
  TenantCompatibilityProfile["sleep_schedule"],
  string
> = {
  early_bird: "Early Bird",
  night_owl: "Night Owl",
  flexible: "Flexible",
};

const NOISE_LABELS: Record<TenantCompatibilityProfile["noise_level"], string> =
  {
    quiet: "Quiet",
    moderate: "Moderate",
    social: "Social",
  };

const GUEST_LABELS: Record<
  TenantCompatibilityProfile["guests_frequency"],
  string
> = {
  rarely: "Rarely",
  sometimes: "Sometimes",
  often: "Often",
};

// ─── Segmented Ring ───────────────────────────────────────────────────────────

const TOTAL_SEGMENTS = 10;
const CX = 60;
const CY = 60;
const R = 44;
const STROKE_W = 9;
const GAP_DEG = 4;
const SEG_DEG = 360 / TOTAL_SEGMENTS - GAP_DEG;

function describeArc(startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = CX + R * Math.cos(toRad(startDeg));
  const y1 = CY + R * Math.sin(toRad(startDeg));
  const x2 = CX + R * Math.cos(toRad(endDeg));
  const y2 = CY + R * Math.sin(toRad(endDeg));
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

type ScoreTier = "green" | "amber" | "red";

const TIER_STROKE_CLASSES: Record<ScoreTier, string> = {
  green: "stroke-emerald-500 dark:stroke-emerald-400",
  amber: "stroke-amber-500 dark:stroke-amber-400",
  red: "stroke-red-500 dark:stroke-red-400",
};

interface SegmentedRingProps {
  targetScore: number;
  shouldAnimate: boolean;
}

function SegmentedRing({ targetScore, shouldAnimate }: SegmentedRingProps) {
  const normalizedTarget = normalizeCompatibilityPercentage(targetScore);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let rafId: number;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * normalizedTarget));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shouldAnimate, normalizedTarget]);

  const tier = getScoreTier(normalizedTarget);
  const colors = SCORE_TIER_CLASSES[tier];
  const filledSegments = Math.round((displayScore / 100) * TOTAL_SEGMENTS);

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`${displayScore}% compatibility score`}
        role="img"
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
          const startDeg = i * (360 / TOTAL_SEGMENTS);
          const endDeg = startDeg + SEG_DEG;
          const isFilled = i < filledSegments;

          return (
            <path
              key={i}
              d={describeArc(startDeg, endDeg)}
              fill="none"
              strokeWidth={STROKE_W}
              strokeLinecap="butt"
              className={cn(
                isFilled
                  ? TIER_STROKE_CLASSES[tier]
                  : "stroke-muted-foreground/20",
              )}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className={cn(
            "text-2xl font-bold  tabular-nums leading-none",
            colors.text,
          )}
        >
          {displayScore}%
        </span>
        <span className="text-[11px]  text-muted-foreground mt-1 leading-none">
          match
        </span>
      </div>
    </div>
  );
}

// ─── Field comparisons ────────────────────────────────────────────────────────

interface FieldComparison {
  label: string;
  matches: boolean;
  viewerValue: string;
  tenantValue: string;
}

function getFieldComparisons(
  viewer: TenantCompatibilityProfile,
  tenant: TenantCompatibilityProfile,
): FieldComparison[] {
  const cleanDiff = Math.abs(viewer.cleanliness - tenant.cleanliness);

  return [
    {
      label: "Sleep Schedule",
      matches:
        viewer.sleep_schedule === tenant.sleep_schedule ||
        viewer.sleep_schedule === "flexible" ||
        tenant.sleep_schedule === "flexible",
      viewerValue: SLEEP_LABELS[viewer.sleep_schedule],
      tenantValue: SLEEP_LABELS[tenant.sleep_schedule],
    },
    {
      label: "Cleanliness",
      matches: cleanDiff <= 1,
      viewerValue: `${viewer.cleanliness}/5`,
      tenantValue: `${tenant.cleanliness}/5`,
    },
    {
      label: "Noise Level",
      matches:
        viewer.noise_level === tenant.noise_level ||
        viewer.noise_level === "moderate" ||
        tenant.noise_level === "moderate",
      viewerValue: NOISE_LABELS[viewer.noise_level],
      tenantValue: NOISE_LABELS[tenant.noise_level],
    },
    {
      label: "Guests",
      matches: viewer.guests_frequency === tenant.guests_frequency,
      viewerValue: GUEST_LABELS[viewer.guests_frequency],
      tenantValue: GUEST_LABELS[tenant.guests_frequency],
    },
    {
      label: "Smoking",
      matches: viewer.smoking === tenant.smoking,
      viewerValue: viewer.smoking ? "Smoker" : "Non-smoker",
      tenantValue: tenant.smoking ? "Smoker" : "Non-smoker",
    },
    {
      label: "Pets",
      matches: viewer.pets === tenant.pets,
      viewerValue: viewer.pets ? "Has pets" : "No pets",
      tenantValue: tenant.pets ? "Has pets" : "No pets",
    },
    {
      label: "Major",
      matches:
        !!viewer.major && !!tenant.major && viewer.major === tenant.major,
      viewerValue: viewer.major || "Unspecified",
      tenantValue: tenant.major || "Unspecified",
    },
  ];
}

// ─── Tenant Breakdown Item ────────────────────────────────────────────────────

interface TenantBreakdownItemProps {
  tenantIndex: number;
  score: number;
  viewer: TenantCompatibilityProfile;
  tenant: TenantCompatibilityProfile;
}

function TenantBreakdownItem({
  tenantIndex,
  score,
  viewer,
  tenant,
}: TenantBreakdownItemProps) {
  const [expanded, setExpanded] = useState(false);
  const tier = getScoreTier(score);
  const colors = SCORE_TIER_CLASSES[tier];
  const comparisons = getFieldComparisons(viewer, tenant);
  const matchCount = comparisons.filter((c) => c.matches).length;

  const sharedHobbies = (viewer.hobbies ?? []).filter((h) =>
    (tenant.hobbies ?? []).includes(h),
  );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/40 transition-colors text-left gap-3"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 tabular-nums",
              colors.border,
              colors.bg,
              colors.text,
            )}
          >
            {score}%
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">
              Tenant {tenantIndex}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">
              {matchCount}/{comparisons.length} factors match
              {sharedHobbies.length > 0 &&
                ` · ${sharedHobbies.length} shared hobbies`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/20 divide-y divide-border/50">
          {comparisons.map((comp) => (
            <div
              key={comp.label}
              className="flex items-start gap-3 px-4 py-2.5"
            >
              {comp.matches ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 dark:text-red-500 shrink-0 mt-0.5" />
              )}
              <span className="text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
                {comp.label}
              </span>
              <div className="flex-1 min-w-0">
                {comp.matches ? (
                  <span className="text-xs font-medium text-foreground">
                    {comp.viewerValue}
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-medium text-foreground">
                      {comp.viewerValue}
                    </span>
                    <span className="text-muted-foreground/50 text-[10px]">
                      vs
                    </span>
                    <span
                      className={cn("font-medium", SCORE_TIER_CLASSES.red.text)}
                    >
                      {comp.tenantValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sharedHobbies.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-2.5">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Shared hobbies
                </p>
                <div className="flex flex-wrap gap-1">
                  {sharedHobbies.map((h) => (
                    <Badge key={h} variant="secondary" className="text-xs h-5">
                      {h}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── State components ─────────────────────────────────────────────────────────

function NoTenantsState() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 rounded-lg bg-muted/40 border border-border/50 p-4">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            No tenants have joined this listing yet — compatibility scores will
            appear once they do.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ListedAloneState() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 leading-snug">
              You&apos;re listed in this property
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              You&apos;re currently the only tenant here. Compatibility scores
              will appear once other tenants join.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CompatibilitySectionProps {
  viewerProfile: TenantCompatibilityProfile;
  /** Other tenants — viewer's own profile already excluded by the server */
  tenants: TenantCompatibilityProfile[];
  isViewerTenant: boolean;
  maxOccupants: number;
}

export function CompatibilitySection({
  viewerProfile,
  tenants,
  isViewerTenant,
  maxOccupants,
}: CompatibilitySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const shouldShowCompatibility = tenants.length > 0;

  const result = useMemo(() => {
    if (!shouldShowCompatibility) return null;
    return calculateCollectiveCompatibility(viewerProfile, tenants);
  }, [shouldShowCompatibility, viewerProfile, tenants]);

  // Trigger animation when the card scrolls into view
  useEffect(() => {
    if (!shouldShowCompatibility || hasAnimated || !sectionRef.current) return;

    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldShowCompatibility, hasAnimated]);

  // ── Single occupancy → show nothing ───────────────────────────────────────
  if (maxOccupants <= 1) return null;

  // ── No tenants at all ─────────────────────────────────────────────────────
  if (!isViewerTenant && tenants.length === 0) return <NoTenantsState />;

  // ── Viewer is listed alone ────────────────────────────────────────────────
  if (isViewerTenant && tenants.length === 0) return <ListedAloneState />;

  // ── Show compatibility ────────────────────────────────────────────────────
  if (!result) return null;

  const normalizedOverallScore = normalizeCompatibilityPercentage(
    result.overallScore,
  );
  const tier = getScoreTier(normalizedOverallScore);
  const colors = SCORE_TIER_CLASSES[tier];
  const matchLabel = getScoreLabel(normalizedOverallScore);

  return (
    <Card ref={sectionRef}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Compatibility
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Score ring + summary */}
        <div className="flex items-center gap-5 sm:gap-6">
          <SegmentedRing
            targetScore={normalizedOverallScore}
            shouldAnimate={hasAnimated}
          />
          <div className="flex-1 min-w-0">
            <p className={cn("text-xl font-bold leading-tight", colors.text)}>
              {matchLabel}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              with {tenants.length} current tenant
              {tenants.length !== 1 ? "s" : ""}
            </p>

            {/* Quick-win badges for deal-breaker matches */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {result.details.smoking.matches === tenants.length && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                  Smoking
                </span>
              )}
              {result.details.pets.matches === tenants.length && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                  Pets
                </span>
              )}
              {result.details.sleep_schedule.matches === tenants.length && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                  Sleep
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View breakdown toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground gap-1.5"
          onClick={() => setBreakdownOpen((p) => !p)}
        >
          {breakdownOpen ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide breakdown
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View per-tenant breakdown
            </>
          )}
        </Button>

        {/* Per-tenant breakdown */}
        {breakdownOpen && (
          <div className="space-y-2">
            {result.tenantMatches.map((tm) => {
              const tenant = tenants[tm.tenantIndex - 1];
              if (!tenant) return null;
              return (
                <TenantBreakdownItem
                  key={tm.tenantIndex}
                  tenantIndex={tm.tenantIndex}
                  score={tm.score}
                  viewer={viewerProfile}
                  tenant={tenant}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
