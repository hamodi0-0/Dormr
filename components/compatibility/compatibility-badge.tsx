"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScoreTier, SCORE_TIER_CLASSES } from "@/lib/compatibilityCalc";

interface CompatibilityBadgeProps {
  /** null = listing has no tenants yet */
  score: number | null;
  tenantCount: number;
  className?: string;
}

export function CompatibilityBadge({
  score,
  tenantCount,
  className,
}: CompatibilityBadgeProps) {
  // No tenants yet — faded placeholder
  if (score === null || tenantCount === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-0.5 opacity-50",
          className,
        )}
      >
        <span className="text-xs text-muted-foreground font-medium">
          No tenants yet
        </span>
      </div>
    );
  }

  const tier = getScoreTier(score);
  const colors = SCORE_TIER_CLASSES[tier];

  return (
    <div className={cn("flex flex-col items-start gap-0.5", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold",
          colors.bg,
          colors.text,
          colors.border,
        )}
      >
        <Sparkles className="h-3 w-3 shrink-0" />
        {score}% Compatible
      </div>
      <span className="text-[10px] text-muted-foreground pl-1">
        with {tenantCount} tenant{tenantCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
