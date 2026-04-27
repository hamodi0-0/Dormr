"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";
import Hero from "@/components/landingPage/hero";
import About from "@/components/landingPage/about";
import HowItWorks from "@/components/landingPage/how-it-works";
import ForListers from "@/components/landingPage/for-listers";

export default function LandingPage() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <HowItWorks />
        <ForListers />
      </main>
      <Footer />

      <LoginModal />
      <SignupModal />
    </div>
  );
}
