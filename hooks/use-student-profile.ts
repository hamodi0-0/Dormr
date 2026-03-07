"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface StudentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  gender: "male" | "female";
  university_name: string;
  university_email: string | null;
  email_verified: boolean;
  year_of_study: "1st_year" | "2nd_year" | "3rd_year" | "4th_year" | "graduate";
  major: string;
  bio: string | null;
  sleep_schedule: "early_bird" | "night_owl" | "flexible";
  cleanliness: number;
  noise_level: "quiet" | "moderate" | "social";
  guests_frequency: "rarely" | "sometimes" | "often";
  study_location: "library" | "room" | "both";
  smoking: boolean;
  pets: boolean;
  diet_preference: "no_preference" | "vegetarian" | "vegan" | "halal" | "other";
  hobbies: string[];
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchStudentProfile(): Promise<StudentProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as StudentProfile;
}

export function useStudentProfile(initialData?: StudentProfile) {
  return useQuery<StudentProfile | null>({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
