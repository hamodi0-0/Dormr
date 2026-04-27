"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Repeat,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useListerProfile } from "@/hooks/use-lister-profile";
import { useListerPendingCount } from "@/hooks/use-notifications";
import Image from "next/image";

interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/lister/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lister/listings", label: "My Listings", icon: Home },
  { href: "/lister/notifications", label: "Notifications", icon: Bell },
  {
    href: "/lister/chats",
    label: "Chats",
    icon: MessageSquare,
    badge: "Soon",
  },
  { href: "/lister/settings", label: "Settings", icon: Settings },
];

interface ListerDashboardHeaderProps {
  title?: string;
}

export function ListerDashboardHeader({ title }: ListerDashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [isSwitchingToStudent, setIsSwitchingToStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const { data: profile, isLoading } = useListerProfile();
  const pendingCount = useListerPendingCount(profile?.id ?? null);

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isActive = (href: string) => {
    if (href === "/lister/dashboard") return pathname === "/lister/dashboard";
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

  const handleSwitchToStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !studentPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSwitchingToStudent(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: studentPassword,
      });

      if (error) throw error;

      if (data.user?.user_metadata?.user_type !== "student") {
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a student");
      }

      toast.success("Switched to student account");
      setSwitchDialogOpen(false);
      setStudentEmail("");
      setStudentPassword("");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to switch account. Please try again.",
      );
      setIsSwitchingToStudent(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-2 sm:gap-3">
        {title && (
          <p className="text-base font-semibold text-muted-foreground truncate">
            {title}
          </p>
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
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
              <DropdownMenuItem onClick={() => setSwitchDialogOpen(true)}>
                <Repeat className="h-4 w-4" />
                Switch to student account
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
            onClick={() => setMobileOpen(true)}
            className="md:hidden shrink-0 text-muted-foreground hover:text-foreground"
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
            href="/lister/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <div className=" bg-primary rounded-lg h-8 w-8 flex items-center mr-2 justify-center shrink-0">
              <Image
                src="/images/transparent-logo.png"
                alt="Dormr Logo"
                width={36}
                height={36}
              />
            </div>
            <span className="font-serif font-medium text-foreground text-2xl">
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
            const isNotifications = item.href === "/lister/notifications";

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

                {isNotifications && pendingCount > 0 ? (
                  <span className="h-5 min-w-5 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white flex items-center justify-center leading-none">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                ) : item.badge ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <Dialog
        open={switchDialogOpen}
        onOpenChange={(open) => {
          if (!isSwitchingToStudent) {
            setSwitchDialogOpen(open);
            if (!open) {
              setStudentEmail("");
              setStudentPassword("");
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to student account</DialogTitle>
            <DialogDescription>
              Sign in with your student account credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSwitchToStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="switch-student-email">University Email</Label>
              <Input
                id="switch-student-email"
                type="email"
                placeholder="you@university.edu"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                disabled={isSwitchingToStudent}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="switch-student-password">Password</Label>
              <Input
                id="switch-student-password"
                type="password"
                placeholder="••••••••"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                disabled={isSwitchingToStudent}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSwitchingToStudent}
            >
              {isSwitchingToStudent ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
