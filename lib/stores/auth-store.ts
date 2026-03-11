import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export type LoginTab = "student" | "lister";

type AuthState = {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  isChecking: boolean;
  showLogin: boolean;
  showSignup: boolean;
  loginTab: LoginTab;
  checkAuthStatus: () => Promise<void>;
  setShowLogin: (open: boolean, tab?: LoginTab) => void;
  setShowSignup: (open: boolean) => void;
  loginSuccess: () => Promise<void>;
  signupSuccess: () => Promise<void>;
  handleSetupProfile: (isLoggedIn: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isOnboarded: false,
  isChecking: true,
  showLogin: false,
  showSignup: false,
  loginTab: "student",

  checkAuthStatus: async () => {
    set({ isChecking: true });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.user_metadata?.user_type === "student") {
          set({ isLoggedIn: true });

          const { data: profile } = await supabase
            .from("student_profiles")
            .select("profile_completed")
            .eq("id", user.id)
            .single();

          set({ isOnboarded: profile?.profile_completed ?? false });
        } else {
          // Non-student user (lister or unknown) — don't sign them out,
          // just mark as not-logged-in for the landing page UI.
          // Signing out here would break lister sessions if they ever
          // visit the landing page.
          set({ isLoggedIn: false, isOnboarded: false });
        }
      } else {
        set({ isLoggedIn: false, isOnboarded: false });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ isLoggedIn: false, isOnboarded: false });
    } finally {
      set({ isChecking: false });
    }
  },

  // Tab is optional — defaults to "student" when not specified
  setShowLogin: (open, tab) =>
    set({
      showLogin: open,
      ...(tab !== undefined && { loginTab: tab }),
    }),

  setShowSignup: (open) => set({ showSignup: open }),

  loginSuccess: async () => {
    set({ showLogin: false });
    await get().checkAuthStatus();
  },

  signupSuccess: async () => {
    set({ showSignup: false });
    await get().checkAuthStatus();
  },

  handleSetupProfile: (isLoggedIn: boolean) => {
    if (!isLoggedIn) {
      get().setShowSignup(true);
    } else {
      redirect("/onboarding");
    }
  },
}));

export default useAuthStore;
