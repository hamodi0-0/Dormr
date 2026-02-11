import { create } from "zustand";

export interface OnboardingData {
  // Personal Info
  full_name: string;
  phone: string;
  avatar_url: string;
  gender: "male" | "female";

  // University Info
  university_name: string;
  year_of_study: "1st_year" | "2nd_year" | "3rd_year" | "4th_year" | "graduate";
  major: string;
  bio: string;

  // Compatibility Preferences
  sleep_schedule: "early_bird" | "night_owl" | "flexible";
  cleanliness: number; // 1-5
  noise_level: "quiet" | "moderate" | "social";
  guests_frequency: "rarely" | "sometimes" | "often";
  study_location: "library" | "room" | "both";
  smoking: boolean;
  pets: boolean;
  diet_preference: "no_preference" | "vegetarian" | "vegan" | "halal" | "other";
  hobbies: string[];
}

interface OnboardingStore {
  currentStep: number;
  totalSteps: number;
  data: Partial<OnboardingData>;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 0,
  totalSteps: 5, // 4 steps total
  data: {},

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),

  resetOnboarding: () => set({ currentStep: 0, data: {} }),
}));
