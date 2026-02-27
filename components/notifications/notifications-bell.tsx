"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  userId: string | null;
  href: string;
  className?: string;
}

export function NotificationBell({
  userId,
  href,
  className,
}: NotificationBellProps) {
  const unreadCount = useUnreadNotificationCount(userId);

  return (
    <Button
      variant="ghost"
      size="icon"
      asChild
      className={cn("relative", className)}
      aria-label={
        unreadCount > 0
          ? `Notifications — ${unreadCount} unread`
          : "Notifications"
      }
    >
      <Link href={href}>
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
            {/* Ping animation */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-bold text-white items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </Link>
    </Button>
  );
}
