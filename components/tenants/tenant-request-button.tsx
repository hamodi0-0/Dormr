"use client";

import { useTransition, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantRequestStatus } from "@/hooks/use-tenant-request-status";
import { submitTenantRequest } from "@/app/actions/tenant-actions";

interface TenantRequestButtonProps {
  listingId: string;
  userId: string | null;
}

export function TenantRequestButton({
  listingId,
  userId,
}: TenantRequestButtonProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useTenantRequestStatus(listingId, userId);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (!userId) return null;

  if (isLoading) {
    return <Skeleton className="h-9 w-52 rounded-md" />;
  }

  const status = data?.status ?? "none";

  const handleSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("listing_id", listingId);
      if (message.trim()) formData.set("message", message.trim());

      const result = await submitTenantRequest(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Request sent! The lister will be notified.");
        setDialogOpen(false);
        setMessage("");
        queryClient.invalidateQueries({
          queryKey: ["tenant-request-status", listingId, userId],
        });
      }
    });
  };

  if (status === "accepted" || status === "is_tenant") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          You&apos;re listed as a tenant here
        </span>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Request pending
        </span>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">
          Request was declined
        </span>
      </div>
    );
  }

  // status === 'none'
  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="gap-2"
        variant="outline"
      >
        <UserPlus className="h-4 w-4" />
        Request to become a tenant
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to become a tenant</DialogTitle>
            <DialogDescription>
              Send a request to the lister. You can include an optional message
              to introduce yourself.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label
                htmlFor="request-message"
                className="flex items-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                Message{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="request-message"
                placeholder="Hi, I'm a 2nd year student at UCL. I'd love to be listed as a tenant…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                className="resize-none min-h-24"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/300
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
