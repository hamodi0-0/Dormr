"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_CLASSES } from "@/lib/compatibilityCalc";

interface CompatibilityBadgeProps {
  score: number | null;
  tenantCount: number;
  className?: string;
}

export function CompatibilityBadge({
  score,
  tenantCount,
  className,
}: CompatibilityBadgeProps) {
  // No data → hide completely on browse page
  if (score === null || tenantCount === 0) return null;

  const tier = getScoreTier(score);
  const colors = SCORE_TIER_CLASSES[tier];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0",
        colors.bg,
        colors.border,
        className,
      )}
    >
      <Sparkles className={cn("h-3.5 w-3.5 shrink-0", colors.text)} />
      <span className={cn("text-sm font-bold tabular-nums", colors.text)}>
        {score}%
      </span>
      <span className="text-xs text-muted-foreground font-normal">match</span>
    </div>
  );
}
