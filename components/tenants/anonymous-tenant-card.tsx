import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnonymousTenantCardProps {
  index: number;
}

export function AnonymousTenantCard({ index }: AnonymousTenantCardProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4 flex items-center gap-3">
        {/* Generic avatar */}
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Tenant {index}</p>
          <p className="text-xs text-muted-foreground">Student</p>
        </div>

        <Badge variant="secondary" className="text-xs shrink-0">
          Verified
        </Badge>
      </CardContent>
    </Card>
  );
}
