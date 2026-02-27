"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Trash2, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeTenant } from "@/app/actions/tenant-actions";

interface ConfirmedTenantRowProps {
  listingId: string;
  userId: string;
  tenantName: string;
  tenantUniversity: string;
  addedAt: string;
}

export function ConfirmedTenantRow({
  listingId,
  userId,
  tenantName,
  tenantUniversity,
  addedAt,
}: ConfirmedTenantRowProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const initials = tenantName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = format(new Date(addedAt), "d MMM yyyy");

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeTenant(listingId, userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${tenantName} removed from tenants.`);
        queryClient.invalidateQueries({
          queryKey: ["listing-tenants", listingId],
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {tenantName}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GraduationCap className="h-3 w-3 shrink-0" />
          <span className="truncate">{tenantUniversity}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
        Added {formattedDate}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Remove ${tenantName}`}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {tenantName} from the confirmed tenants list.
              They can re-request if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
