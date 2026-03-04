"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

import { useAuthStore } from "@/lib/stores/auth-store";
import Image from "next/image";

export function Header() {
  const setShowLogin = useAuthStore((s) => s.setShowLogin);
  const setShowSignup = useAuthStore((s) => s.setShowSignup);
  const handleSetupProfile = useAuthStore((s) => s.handleSetupProfile);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    } else {
      window.location.hash = id;
    }
  };

  return (
    <>
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Image
                src="/images/transparent-logo.png"
                alt="Dormr Logo"
                width={32}
                height={32}
              />
            </div>
            <span className="font-serif font-semibold tracking-[-0.02em] text-3xl logo-serif">
              Dormr
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, "about")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              About
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              How It Works
            </a>
            <a
              href="#for-listers"
              onClick={(e) => handleNavClick(e, "for-listers")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              For Listers
            </a>
          </nav>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isLoggedIn && !isOnboarded && (
              <Button
                variant="default"
                onClick={() => handleSetupProfile(isLoggedIn)}
              >
                Complete Profile
              </Button>
            )}
            {!isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogin(true, "student")}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button onClick={() => setShowSignup(true)}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
