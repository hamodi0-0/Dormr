"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useListerProfile } from "@/hooks/use-lister-profile";
import { useListerPendingCount } from "@/hooks/use-notifications";
import Image from "next/image";

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
  {
    href: "/lister/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function ListerSidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setOpen = useSidebarStore((state) => state.setOpen);
  const [isHovering, setIsHovering] = useState(false);

  const { data: profile } = useListerProfile();
  const pendingCount = useListerPendingCount(profile?.id ?? null);

  const shouldOpen = isOpen || isHovering;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          if (!isOpen) setOpen(false);
        }}
        className={cn(
          "fixed left-0 top-0 z-40 h-full hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          shouldOpen ? "w-64" : "w-16",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border h-16 shrink-0",
            shouldOpen ? "px-5" : "justify-center px-0",
          )}
        >
          <Link href="/lister/dashboard" className="flex items-center ">
            <div className=" bg-primary/90 rounded-lg h-8 w-8 flex items-center mr-2 justify-center shrink-0">
              <Image
                src="/images/transparent-logo.png"
                alt="Dormr Logo"
                width={36}
                height={36}
              />
            </div>
            {shouldOpen && (
              <span className="font-serif font-medium text-foreground text-2xl">
                Dormr
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {shouldOpen && (
            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Management
            </p>
          )}
          <ul className={cn("space-y-0.5", shouldOpen ? "px-3" : "px-2")}>
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
                    !shouldOpen && "justify-center px-0 w-10 h-10 mx-auto",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <span className="relative shrink-0">
                    <Icon
                      className={cn(
                        "transition-colors",
                        shouldOpen ? "h-4 w-4" : "h-5 w-5",
                        isActive
                          ? "text-primary"
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                      )}
                    />
                    {isNotifications && pendingCount > 0 && !shouldOpen && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] font-bold text-white flex items-center justify-center leading-none">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </span>
                  {shouldOpen && (
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
      </aside>
    </TooltipProvider>
  );
}
