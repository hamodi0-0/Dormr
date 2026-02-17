"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

interface HeaderProps {
  isLoggedIn?: boolean;
  isOnboarded?: boolean;
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

export function Header({
  isLoggedIn = false,
  isOnboarded = false,
  onLoginSuccess,
  onSignupSuccess,
}: HeaderProps) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

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

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    onLoginSuccess?.();
  };

  const handleSignupSuccess = () => {
    setSignupModalOpen(false);
    onSignupSuccess?.();
  };

  const switchToSignup = () => {
    setLoginModalOpen(false);
    setSignupModalOpen(true);
  };

  const switchToLogin = () => {
    setSignupModalOpen(false);
    setLoginModalOpen(true);
  };

  return (
    <>
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">
                D
              </span>
            </div>
            <span className="text-xl font-serif font-medium">Dormr</span>
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

            {isLoggedIn && isOnboarded && (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}

            {isLoggedIn && !isOnboarded && (
              <Link href="/onboarding">
                <Button>Complete Profile</Button>
              </Link>
            )}

            {!isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setLoginModalOpen(true)}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button onClick={() => setSignupModalOpen(true)}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSwitchToSignup={switchToSignup}
        onSuccess={handleLoginSuccess}
      />

      <SignupModal
        open={signupModalOpen}
        onOpenChange={setSignupModalOpen}
        onSwitchToLogin={switchToLogin}
        onSuccess={handleSignupSuccess}
      />
    </>
  );
}
