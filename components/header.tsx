"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/login-modal";
import Link from "next/link";

interface HeaderProps {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    window.location.href = "/dashboard";
  };

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Dorm Match</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
                history.pushState(null, "", "#about");
              }}
            >
              About
            </Link>

            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
                history.pushState(null, "", "#how-it-works");
              }}
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button>Go To Dashboard</Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>
                  Sign In
                </Button>
                <Button onClick={() => setLoginModalOpen(true)}>
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
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
