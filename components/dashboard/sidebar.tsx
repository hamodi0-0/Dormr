"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  Building2,
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
import { useStudentProfile } from "@/hooks/use-student-profile";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard/chats",
    label: "Chats",
    icon: MessageSquare,
    badge: "Soon",
  },
  {
    href: "/dashboard/saved",
    label: "Saved Dorms",
    icon: Heart,
    badge: "Soon",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    badge: "Soon",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const router = useRouter();

  // Use React Query - will use cached data if available
  const { data: profile, isLoading } = useStudentProfile();

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
          <Link href="/dashboard" className="flex items-center gap-2.5">
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
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

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
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors",
                      isOpen ? "h-4 w-4" : "h-5 w-5",
                      isActive
                        ? "text-primary"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80",
                    )}
                  />
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0 h-5"
                        >
                          {item.badge}
                        </Badge>
                      )}
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
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 h-5"
                          >
                            {item.badge}
                          </Badge>
                        )}
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
          {/* User Info */}
          {isOpen ? (
            <Link
              href="/dashboard/profile"
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
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate leading-none mb-0.5">
                      {profile?.full_name ?? "Student"}
                    </p>
                    <p className="text-xs text-primary font-medium uppercase tracking-wide">
                      Student
                    </p>
                  </div>
                </>
              )}
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex justify-center py-2"
                >
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
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                {profile?.full_name ?? "Student"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Sign Out */}
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
