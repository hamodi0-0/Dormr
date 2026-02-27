"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, UserPlus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationRead } from "@/app/actions/tenant-actions";
import type { Notification, NotificationType } from "@/lib/types/listing";

interface NotificationItemProps {
  notification: Notification;
  userId: string;
}

const ICON_MAP: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  tenant_request_received: UserPlus,
  request_accepted: CheckCircle2,
  request_rejected: XCircle,
};

const ICON_COLOR_MAP: Record<NotificationType, string> = {
  tenant_request_received: "text-primary",
  request_accepted: "text-emerald-500",
  request_rejected: "text-muted-foreground",
};

export function NotificationItem({
  notification,
  userId,
}: NotificationItemProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const Icon = ICON_MAP[notification.type];
  const iconColor = ICON_COLOR_MAP[notification.type];
  const postedAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  const listingId = notification.metadata?.listing_id;

  const handleClick = () => {
    startTransition(async () => {
      if (!notification.read) {
        await markNotificationRead(notification.id);
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      }

      if (listingId) {
        router.push(`/dashboard/listings/${listingId}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors duration-150",
        "hover:bg-accent/50 focus-visible:outline-none focus-visible:bg-accent/50",
        !notification.read && "bg-primary/5 dark:bg-primary/10",
        isPending && "opacity-60",
      )}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            notification.read
              ? "text-muted-foreground"
              : "text-foreground font-medium",
          )}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-1">{postedAgo}</p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <Circle className="h-2 w-2 fill-primary text-primary mt-1.5 shrink-0" />
      )}
    </button>
  );
}
