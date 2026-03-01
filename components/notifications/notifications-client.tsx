"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
  UserPlus,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useListerNotifications,
  useStudentNotifications,
  type ListerNotificationItem,
  type StudentNotificationItem,
} from "@/hooks/use-notifications";
import {
  acceptTenantRequest,
  rejectTenantRequest,
  markStudentNotificationsRead,
} from "@/app/actions/tenant-actions";
import type { TenantRequestStatus } from "@/lib/types/listing";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantRequestStatus }) {
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300 text-xs gap-1"
      >
        Pending
      </Badge>
    );
  if (status === "accepted")
    return (
      <Badge
        variant="outline"
        className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 text-xs gap-1"
      >
        <CheckCircle2 className="h-2.5 w-2.5" />
        Accepted
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="border-border bg-muted/50 text-muted-foreground text-xs gap-1"
    >
      <XCircle className="h-2.5 w-2.5" />
      Declined
    </Badge>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{message}</p>
      </div>
    </div>
  );
}

// ─── Lister notification item ─────────────────────────────────────────────────

function ListerNotificationItem({ item }: { item: ListerNotificationItem }) {
  const queryClient = useQueryClient();
  const [isAccepting, startAccept] = useTransition();
  const [isRejecting, startReject] = useTransition();
  const isPending = isAccepting || isRejecting;

  const initials = item.requesterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAccept = () => {
    startAccept(async () => {
      const result = await acceptTenantRequest(item.requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${item.requesterName} added as tenant`);
        queryClient.invalidateQueries({ queryKey: ["lister-notifications"] });
      }
    });
  };

  const handleReject = () => {
    startReject(async () => {
      const result = await rejectTenantRequest(item.requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Request declined");
        queryClient.invalidateQueries({ queryKey: ["lister-notifications"] });
      }
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-4 px-4 py-4",
        item.status === "pending" && "bg-primary/5 dark:bg-primary/10",
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <UserPlus className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage
                src={item.requesterAvatar ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">
              {item.requesterName}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
            <GraduationCap className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {item.requesterMajor} · {item.requesterUniversity}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Wants to be a tenant on{" "}
            <Link
              href={`/lister/listings/${item.listingId}/tenants`}
              className="font-medium text-primary hover:underline"
            >
              {item.listingTitle}
            </Link>{" "}
            ·{" "}
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </p>

          {item.message && (
            <div className="flex items-start gap-2 mt-2 rounded-md bg-muted/50 border border-border/50 px-3 py-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                &ldquo;{item.message}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {item.status === "pending" && (
        <div className="flex items-center gap-2 shrink-0 sm:mt-0.5">
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
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
            className="h-8 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
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
      )}
    </div>
  );
}

// ─── Student notification item ────────────────────────────────────────────────

function StudentNotificationItem({ item }: { item: StudentNotificationItem }) {
  const isAccepted = item.status === "accepted";
  const isUnread = item.readAt === null;

  return (
    <Link
      href={`/dashboard/listings/${item.listingId}`}
      className="flex items-start gap-3 px-4 py-4 hover:bg-accent/50 transition-colors group relative"
    >
      {/* Unread dot */}
      {isUnread && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      )}

      <div
        className={cn(
          "mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isAccepted ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-muted",
        )}
      >
        {isAccepted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p
            className={cn(
              "text-sm text-foreground",
              isUnread ? "font-semibold" : "font-medium",
            )}
          >
            {item.listingTitle}
          </p>
          <StatusBadge status={item.status} />
        </div>

        <p className="text-xs text-muted-foreground">
          {item.listingCity} ·{" "}
          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
        </p>

        <p
          className={cn(
            "text-xs mt-0.5",
            isAccepted
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          {isAccepted
            ? "You've been confirmed as a tenant on this listing."
            : "Your request was declined by the lister."}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

// ─── Lister Notifications Client ──────────────────────────────────────────────

interface ListerNotificationsClientProps {
  userId: string;
  initialData: ListerNotificationItem[];
}

export function ListerNotificationsClient({
  userId,
  initialData,
}: ListerNotificationsClientProps) {
  const { data: items = [] } = useListerNotifications(userId, initialData);

  const pendingItems = items.filter((i) => i.status === "pending");
  const resolvedItems = items.filter((i) => i.status !== "pending");

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
          Notifications
        </h1>
        {pendingItems.length > 0 && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {pendingItems.length} pending request
            {pendingItems.length !== 1 ? "s" : ""} need your attention
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState message="You'll see tenant requests here when students want to be listed on your properties." />
      ) : (
        <div className="space-y-4">
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Needs action ({pendingItems.length})
              </h2>
              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                {pendingItems.map((item, i) => (
                  <div key={item.requestId}>
                    <ListerNotificationItem item={item} />
                    {i < pendingItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Recent activity ({resolvedItems.length})
              </h2>
              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                {resolvedItems.map((item, i) => (
                  <div key={item.requestId}>
                    <ListerNotificationItem item={item} />
                    {i < resolvedItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Student Notifications Client ─────────────────────────────────────────────

interface StudentNotificationsClientProps {
  userId: string;
  initialData: StudentNotificationItem[];
}

export function StudentNotificationsClient({
  userId,
  initialData,
}: StudentNotificationsClientProps) {
  const queryClient = useQueryClient();
  const { data: items = [] } = useStudentNotifications(userId, initialData);
  const hasMarkedRead = useRef(false);

  // Mark all unread notifications as read on first mount
  useEffect(() => {
    if (hasMarkedRead.current) return;

    const unreadIds = items
      .filter((i) => i.readAt === null)
      .map((i) => i.requestId);

    if (unreadIds.length === 0) return;

    hasMarkedRead.current = true;

    markStudentNotificationsRead(unreadIds).then(({ error }) => {
      if (!error) {
        // Optimistically update local cache so the badge drops immediately
        queryClient.setQueryData<StudentNotificationItem[]>(
          ["student-notifications", userId],
          (old) =>
            (old ?? []).map((item) =>
              unreadIds.includes(item.requestId)
                ? { ...item, readAt: new Date().toISOString() }
                : item,
            ),
        );
      }
    });
  }, [items, userId, queryClient]);

  const acceptedItems = items.filter((i) => i.status === "accepted");
  const rejectedItems = items.filter((i) => i.status === "rejected");
  const unreadCount = items.filter((i) => i.readAt === null).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
          Notifications
        </h1>
        {items.length > 0 && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} notification{items.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="text-primary font-medium">
                {" "}
                · {unreadCount} new
              </span>
            )}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState message="You'll be notified here when a lister accepts or declines your tenant request." />
      ) : (
        <div className="space-y-4">
          {acceptedItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Accepted ({acceptedItems.length})
              </h2>
              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                {acceptedItems.map((item, i) => (
                  <div key={item.requestId}>
                    <StudentNotificationItem item={item} />
                    {i < acceptedItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedItems.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Declined ({rejectedItems.length})
              </h2>
              <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                {rejectedItems.map((item, i) => (
                  <div key={item.requestId}>
                    <StudentNotificationItem item={item} />
                    {i < rejectedItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
