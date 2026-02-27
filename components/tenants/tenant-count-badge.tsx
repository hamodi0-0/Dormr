import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TenantCountBadgeProps {
  tenantCount: number;
  maxOccupants: number;
}

export function TenantCountBadge({
  tenantCount,
  maxOccupants,
}: TenantCountBadgeProps) {
  const isFull = tenantCount >= maxOccupants;

  return (
    <Badge
      variant="outline"
      className={
        isFull
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-border bg-muted/50 text-muted-foreground"
      }
    >
      <Users className="h-3 w-3 mr-1" />
      {tenantCount} / {maxOccupants} tenants
    </Badge>
  );
}
