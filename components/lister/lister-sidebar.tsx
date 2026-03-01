"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  User,
  LogOut,
  Building2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useListerProfile } from "@/hooks/use-lister-profile";
import { useListerPendingCount } from "@/hooks/use-notifications";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/lister/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/lister/listings",
    label: "My Listings",
    icon: Home,
  },
  {
    href: "/lister/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/lister/chats",
    label: "Chats",
    icon: MessageSquare,
    badge: "Soon",
  },
];

export function ListerSidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const router = useRouter();

  const { data: profile, isLoading } = useListerProfile();
  const pendingCount = useListerPendingCount(profile?.id ?? null);

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border h-16 shrink-0",
            isOpen ? "px-5" : "justify-center px-0",
          )}
        >
          <Link href="/lister/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="text-lg font-serif font-medium text-sidebar-foreground truncate">
                Dormr
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {isOpen && (
            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Management
            </p>
          )}
          <ul className={cn("space-y-0.5", isOpen ? "px-3" : "px-2")}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/lister/dashboard"
                  ? pathname === "/lister/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              const isNotifications = item.href === "/lister/notifications";

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    !isOpen && "justify-center px-0 w-10 h-10 mx-auto",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <span className="relative shrink-0">
                    <Icon
                      className={cn(
                        "transition-colors",
                        isOpen ? "h-4 w-4" : "h-5 w-5",
                        isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                      )}
                    />
                    {isNotifications && pendingCount > 0 && !isOpen && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] font-bold text-white flex items-center justify-center leading-none">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </span>
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {isNotifications && pendingCount > 0 ? (
                        <span className="ml-auto h-5 min-w-5 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white flex items-center justify-center leading-none">
                          {pendingCount > 9 ? "9+" : pendingCount}
                        </span>
                      ) : item.badge ? (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0 h-5"
                        >
                          {item.badge}
                        </Badge>
                      ) : null}
                    </>
                  )}
                </Link>
              );

              return (
                <li key={item.href}>
                  {!isOpen ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="flex items-center gap-2"
                      >
                        {item.label}
                        {isNotifications && pendingCount > 0 ? (
                          <span className="h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                            {pendingCount > 9 ? "9+" : pendingCount}
                          </span>
                        ) : item.badge ? (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 h-5"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile + Sign Out */}
        <div
          className={cn(
            "border-t border-sidebar-border py-3 space-y-1 shrink-0",
            isOpen ? "px-3" : "px-2",
          )}
        >
          {isOpen ? (
            <Link
              href="/lister/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent/60 transition-colors group"
            >
              {isLoading ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={profile?.avatar_url ?? undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate leading-none mb-0.5">
                      {profile?.full_name ?? "Lister"}
                    </p>
                    <p className="text-xs text-primary font-medium uppercase tracking-wide">
                      Lister
                    </p>
                  </div>
                </>
              )}
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center py-2">
                  {isLoading ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {profile?.full_name ?? "Lister"}
              </TooltipContent>
            </Tooltip>
          )}

          {isOpen ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 px-3 text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 h-10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-10 h-10 mx-auto flex text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
