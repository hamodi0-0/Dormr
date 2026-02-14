"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { LoginModal } from "@/components/login-modal";
import Hero from "@/components/landingPage/hero";
import About from "@/components/landingPage/about";
import HowItWorks from "@/components/landingPage/how-it-works";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("is_onboarded")
          .eq("id", user.id)
          .single();

        if (profile?.is_onboarded) {
          setIsOnboarded(true);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSetupProfile = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    } else {
      router.push("/onboarding");
    }
  };

  const handleGoToDashboard = () => {
    if (!isLoggedIn || !isOnboarded) {
      setLoginModalOpen(true);
    } else {
      router.push("/dashboard");
    }
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    checkAuthStatus();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <Hero />
        <About />
        <HowItWorks
          isLoggedIn={isLoggedIn}
          isOnboarded={isOnboarded}
          handleSetupProfile={handleSetupProfile}
          handleGoToDashboard={handleGoToDashboard}
        />
      </main>
      <Footer />

      <LoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
