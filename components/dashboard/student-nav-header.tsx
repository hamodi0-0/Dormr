"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  MessageSquare,
  Heart,
  Settings,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notifications-bell";
import { useStudentNotifications } from "@/hooks/use-notifications";
import { useStudentProfile } from "@/hooks/use-student-profile";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/listings", label: "Browse Listings", icon: Building2 },
  { href: "/dashboard/chats", label: "Chats", icon: MessageSquare },
  { href: "/dashboard/saved", label: "Saved", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/listings", label: "Browse Listings", icon: Building2 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/chats", label: "Chats", icon: MessageSquare },
  { href: "/dashboard/saved", label: "Saved", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function StudentNavHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profile, isLoading } = useStudentProfile();

  const { data: notifications = [] } = useStudentNotifications(
    profile?.id ?? null,
  );
  const resolvedCount = notifications.length;
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 sm:px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-serif font-medium hidden sm:block">
            Dormr
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="hidden md:flex items-center gap-4 ml-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 group",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                {item.label}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-medium"
                  >
                    {item.badge}
                  </Badge>
                )}
                <span
                  className={cn(
                    "absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary",
                    "transition-transform duration-300 ease-out origin-left",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <NotificationBell
            href="/dashboard/notifications"
            count={resolvedCount}
          />

          <ThemeToggle />

          <Link href="/dashboard/profile" aria-label="My profile">
            <span className="flex items-center justify-center h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium font-serif">
                  {isLoading ? "…" : initials}
                </AvatarFallback>
              </Avatar>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300 ease-in-out md:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-border shadow-2xl",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-serif font-medium">Dormr</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-3 border-t border-border shrink-0">
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium font-serif">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-none">
                {profile?.full_name ?? "Student"}
              </p>
              <p className="text-xs text-primary mt-0.5">View profile</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
