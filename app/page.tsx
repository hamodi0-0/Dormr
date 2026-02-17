"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LoginModal } from "@/components/login-modal";
import { SignupModal } from "@/components/signup-modal";
import Hero from "@/components/landingPage/hero";
import About from "@/components/landingPage/about";
import HowItWorks from "@/components/landingPage/how-it-works";
import ForListers from "@/components/landingPage/for-listers";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
        if (user.user_metadata?.user_type === "student") {
          setIsLoggedIn(true);

          const { data: profile } = await supabase
            .from("student_profiles")
            .select("profile_completed")
            .eq("id", user.id)
            .single();

          if (profile?.profile_completed) {
            setIsOnboarded(true);
          }
        } else {
          await supabase.auth.signOut();
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
      setShowSignup(true);
    } else {
      router.push("/onboarding");
    }
  };

  const handleGoToDashboard = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else if (!isOnboarded) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    checkAuthStatus();
  };

  const handleSignupSuccess = () => {
    setShowSignup(false);
    checkAuthStatus();
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        isOnboarded={isOnboarded}
        onLoginSuccess={handleLoginSuccess}
        onSignupSuccess={handleSignupSuccess}
      />

      <main className="flex-1">
        <Hero />
        <About />
        <HowItWorks
          isLoggedIn={isLoggedIn}
          isOnboarded={isOnboarded}
          handleSetupProfile={handleSetupProfile}
          handleGoToDashboard={handleGoToDashboard}
        />
        <ForListers />
      </main>

      <Footer />

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      <SignupModal
        open={showSignup}
        onOpenChange={setShowSignup}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
        onSuccess={handleSignupSuccess}
      />
    </div>
  );
}
