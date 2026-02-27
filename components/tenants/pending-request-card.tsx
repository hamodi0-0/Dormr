"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  acceptTenantRequest,
  rejectTenantRequest,
} from "@/app/actions/tenant-actions";

interface PendingRequestCardProps {
  requestId: string;
  listingId: string;
  requesterName: string;
  requesterUniversity: string;
  requesterMajor: string;
  requesterAvatar: string | null;
  message: string | null;
  createdAt: string;
}

export function PendingRequestCard({
  requestId,
  listingId,
  requesterName,
  requesterUniversity,
  requesterMajor,
  requesterAvatar,
  message,
  createdAt,
}: PendingRequestCardProps) {
  const queryClient = useQueryClient();
  const [isAccepting, startAccept] = useTransition();
  const [isRejecting, startReject] = useTransition();

  const initials = requesterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const postedAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  const handleAccept = () => {
    startAccept(async () => {
      const result = await acceptTenantRequest(requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${requesterName} has been added as a tenant.`);
        queryClient.invalidateQueries({
          queryKey: ["pending-requests", listingId],
        });
        queryClient.invalidateQueries({
          queryKey: ["listing-tenants", listingId],
        });
      }
    });
  };

  const handleReject = () => {
    startReject(async () => {
      const result = await rejectTenantRequest(requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Request declined.");
        queryClient.invalidateQueries({
          queryKey: ["pending-requests", listingId],
        });
      }
    });
  };

  const isPending = isAccepting || isRejecting;

  return (
    <Card className="py-0">
      <CardContent className="p-4 space-y-3">
        {/* Requester info */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage
              src={requesterAvatar ?? undefined}
              className="object-cover"
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
              {requesterName}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {requesterMajor} · {requesterUniversity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{postedAgo}</p>
          </div>
        </div>

        {/* Optional message */}
        {message && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 border border-border/50 px-3 py-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              &ldquo;{message}&rdquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isAccepting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60"
            onClick={handleReject}
            disabled={isPending}
          >
            {isRejecting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
