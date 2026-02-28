"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useNotifications } from "@/hooks/use-notifications";
import { markAllNotificationsRead } from "@/app/actions/tenant-actions";
import type { Notification } from "@/lib/types/listing";

interface NotificationsClientProps {
  userId: string;
  initialNotifications: Notification[];
  userRole: "student" | "lister";
}

export function NotificationsClient({
  userId,
  initialNotifications,
  userRole,
}: NotificationsClientProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: notifications = [] } = useNotifications(
    userId,
    initialNotifications,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.error) {
        toast.error(result.error);
      } else {
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        toast.success("All notifications marked as read");
      }
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="gap-2 text-xs h-8"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {userRole === "lister"
                ? "You'll be notified when students submit tenant requests."
                : "You'll see updates about your tenant requests here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem
                notification={notification}
                userId={userId}
                userRole={userRole}
              />
              {index < notifications.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
