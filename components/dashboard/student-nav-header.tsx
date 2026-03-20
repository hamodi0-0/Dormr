"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  MessageSquare,
  Heart,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Repeat,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notifications-bell";
import { useStudentUnreadCount } from "@/hooks/use-notifications";
import { useStudentProfile } from "@/hooks/use-student-profile";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

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
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [isSwitchingToLister, setIsSwitchingToLister] = useState(false);
  const { data: profile, isLoading } = useStudentProfile();

  // Only count notifications the student hasn't seen yet
  const unreadCount = useStudentUnreadCount(profile?.id ?? null);

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

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleSwitchToLister = async () => {
    setIsSwitchingToLister(true);
    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?user_type=lister`,
        },
      });

      if (error) throw error;
      // Redirect handled by provider
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to switch account. Please try again.",
      );
      setIsSwitchingToLister(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 sm:px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center shrink-0">
          <div className=" bg-primary rounded-lg h-8 w-8 flex items-center mr-2 justify-center shrink-0">
            <Image
              src="/images/transparent-logo.png"
              alt="Dormr Logo"
              width={36}
              height={36}
            />
          </div>
          <span className="font-serif font-semibold text-foreground text-2xl">
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
            count={unreadCount}
            className="hidden md:inline-flex"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open profile menu"
                className="flex items-center justify-center gap-1 h-9 rounded-full px-0.5 hover:ring-2 hover:ring-primary/20 transition-all"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profile?.avatar_url ?? undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium font-serif">
                    {isLoading ? "…" : initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="h-4 w-4" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSwitchDialogOpen(true)}>
                <Repeat className="h-4 w-4" />
                Switch to lister account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
          "fixed top-0 right-0 z-50 h-full w-72 bg-background border-l border-border shadow-2xl",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
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
            <span className="font-serif font-medium text-foreground text-3xl">
              Dormr
            </span>
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

      <Dialog
        open={switchDialogOpen}
        onOpenChange={(open) => {
          if (!isSwitchingToLister) setSwitchDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to lister account</DialogTitle>
            <DialogDescription>
              Continue with Google to switch accounts. You’ll be signed out of
              your student account and redirected to the lister dashboard.
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={handleSwitchToLister}
            disabled={isSwitchingToLister}
            variant="outline"
            size="lg"
            className="w-full gap-3"
          >
            {isSwitchingToLister ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {isSwitchingToLister ? "Redirecting…" : "Continue with Google"}
          </Button>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSwitchDialogOpen(false)}
              disabled={isSwitchingToLister}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
