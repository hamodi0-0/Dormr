"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  calculateCollectiveCompatibility,
  getScoreTier,
  SCORE_TIER_CLASSES,
} from "@/lib/compatibilityCalc";
import type {
  TenantCompatibilityProfile,
  CompatibilityDetails,
} from "@/lib/types/compatibility";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const tier = getScoreTier(score);
  const colors = SCORE_TIER_CLASSES[tier];

  return (
    <div
      className={cn(
        "w-20 h-20 rounded-full border-4 flex items-center justify-center shrink-0",
        colors.border,
        colors.bg,
      )}
    >
      <span className={cn("text-xl font-bold", colors.text)}>{score}%</span>
    </div>
  );
}

function TenantBar({
  tenantIndex,
  score,
}: {
  tenantIndex: number;
  score: number;
}) {
  const tier = getScoreTier(score);
  const colors = SCORE_TIER_CLASSES[tier];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground shrink-0 w-16">
        Tenant {tenantIndex}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colors.bar,
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn(
          "text-xs font-semibold shrink-0 w-9 text-right",
          colors.text,
        )}
      >
        {score}%
      </span>
    </div>
  );
}

function FactorRow({
  label,
  matches,
  total,
  value,
}: {
  label: string;
  matches: number;
  total: number;
  value?: string;
}) {
  const allMatch = matches === total;
  const noneMatch = matches === 0;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-xs text-muted-foreground">{value}</span>
        )}
        <span
          className={cn(
            "text-xs font-medium",
            allMatch
              ? "text-emerald-600 dark:text-emerald-400"
              : noneMatch
                ? "text-red-500 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400",
          )}
        >
          {matches}/{total} match
        </span>
      </div>
    </div>
  );
}

function BreakdownPanel({
  details,
  tenantCount,
}: {
  details: CompatibilityDetails;
  tenantCount: number;
}) {
  return (
    <div className="pt-3 space-y-1">
      <FactorRow
        label="Sleep Schedule"
        matches={details.sleep_schedule.matches}
        total={tenantCount}
      />
      <FactorRow
        label="Cleanliness"
        matches={details.cleanliness.scores.filter((s) => s.diff <= 1).length}
        total={tenantCount}
        value={`avg diff ${details.cleanliness.averageDiff.toFixed(1)} pts`}
      />
      <FactorRow
        label="Noise Level"
        matches={details.noise_level.matches}
        total={tenantCount}
      />
      <FactorRow
        label="Guests Frequency"
        matches={details.guests_frequency.matches}
        total={tenantCount}
      />
      <FactorRow
        label="Smoking"
        matches={details.smoking.matches}
        total={tenantCount}
      />
      <FactorRow
        label="Pets"
        matches={details.pets.matches}
        total={tenantCount}
      />
      <FactorRow
        label="Same Major"
        matches={details.major.matches}
        total={tenantCount}
      />

      {details.hobbies.shared.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-1.5">
            Shared hobbies with tenants
          </p>
          <div className="flex flex-wrap gap-1.5">
            {details.hobbies.shared.map((h) => (
              <Badge key={h} variant="secondary" className="text-xs">
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function NoTenantsState() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Compatibility scores will appear once tenants are added to this
          listing.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CompatibilitySectionProps {
  viewerProfile: TenantCompatibilityProfile;
  tenants: TenantCompatibilityProfile[];
}

export function CompatibilitySection({
  viewerProfile,
  tenants,
}: CompatibilitySectionProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  if (tenants.length === 0) return <NoTenantsState />;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const result = useMemo(
    () => calculateCollectiveCompatibility(viewerProfile, tenants),
    [viewerProfile, tenants],
  );

  const tier = getScoreTier(result.overallScore);
  const colors = SCORE_TIER_CLASSES[tier];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Compatibility
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall score row */}
        <div className="flex items-center gap-4">
          <ScoreRing score={result.overallScore} />
          <div>
            <p
              className={cn("text-lg font-semibold leading-tight", colors.text)}
            >
              {result.overallScore >= 75
                ? "Great match"
                : result.overallScore >= 50
                  ? "Decent match"
                  : "Low match"}
            </p>
            <p className="text-sm text-muted-foreground">
              with {tenants.length} current tenant
              {tenants.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Per-tenant bars — only shown if >1 tenant */}
        {result.tenantMatches.length > 1 && (
          <div className="space-y-2">
            {result.tenantMatches.map((tm) => (
              <TenantBar
                key={tm.tenantIndex}
                tenantIndex={tm.tenantIndex}
                score={tm.score}
              />
            ))}
          </div>
        )}

        {/* View breakdown toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground -mx-1"
          onClick={() => setBreakdownOpen((p) => !p)}
        >
          {breakdownOpen ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide breakdown
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              View breakdown
            </>
          )}
        </Button>

        {breakdownOpen && (
          <BreakdownPanel
            details={result.details}
            tenantCount={tenants.length}
          />
        )}
      </CardContent>
    </Card>
  );
}
