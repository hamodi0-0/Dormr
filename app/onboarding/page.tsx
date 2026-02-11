"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

// Import step components
import { PersonalInfoStep } from "@/components/onboarding/personal-info-step";
import { UniversityInfoStep } from "@/components/onboarding/university-info-step";
import {
  LifestyleStep,
  PreferencesStep,
  BioStep,
} from "@/components/onboarding/lifestyle-hobbies-steps";

const STEPS = [
  {
    id: 0,
    component: PersonalInfoStep,
    title: "Personal Info",
    requiredFields: ["full_name", "gender"],
  },
  {
    id: 1,
    component: UniversityInfoStep,
    title: "University",
    requiredFields: ["university_name", "year_of_study", "major"],
  },
  {
    id: 2,
    component: LifestyleStep,
    title: "Lifestyle",
    requiredFields: [
      "sleep_schedule",
      "cleanliness",
      "noise_level",
      "guests_frequency",
      "study_location",
    ],
  },
  {
    id: 3,
    component: PreferencesStep,
    title: "Preferences",
    requiredFields: ["smoking", "pets", "diet_preference"],
  },
  { id: 4, component: BioStep, title: "About You", requiredFields: [] }, // bio and hobbies are optional
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    data,
    nextStep,
    previousStep,
    resetOnboarding,
  } = useOnboardingStore();
  const [canProceed, setCanProceed] = useState(false);

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Check if all required fields for current step are filled
  useEffect(() => {
    const requiredFields = STEPS[currentStep].requiredFields;
    const allFieldsFilled = requiredFields.every((field) => {
      const value = data[field as keyof typeof data];
      return value !== undefined && value !== "" && value !== null;
    });
    setCanProceed(allFieldsFilled);
  }, [currentStep, data]);

  const handleFinish = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Save to database
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        ...data,
        is_onboarded: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Profile created successfully!");
      resetOnboarding();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 via-blue-100 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-3xl font-bold text-center">
              Onboarding
            </CardTitle>
            <CardDescription className="text-center text-base">
              Please provide as much information as possible, when filling out
              the automation questions.
            </CardDescription>

            {/* Progress Indicator */}
            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                <p className="text-sm font-medium">
                  {STEPS[currentStep].title}
                </p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Content with Sliding Animation */}
            <div className="relative overflow-hidden min-h-[320px]">
              <div
                className="transition-transform duration-300 ease-out flex"
                style={{
                  transform: `translateX(-${currentStep * 100}%)`,
                }}
              >
                {STEPS.map((step) => (
                  <div key={step.id} className="min-w-full flex-shrink-0 px-1">
                    <step.component />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={isFirstStep}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {!isLastStep ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
