import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface StudentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  university_name: string;
  university_email: string;
  year_of_study: string;
  major: string;
  bio: string | null;
  hobbies: string[];
  sleep_schedule: string;
  cleanliness: number;
  noise_level: string;
  guests_frequency: string;
  study_location: string;
  smoking: boolean;
  pets: boolean;
  diet_preference: string;
  gender: string;
  phone: string | null;
}

async function fetchStudentProfile(): Promise<StudentProfile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Profile not found");

  return data as StudentProfile;
}

export function useStudentProfile(initialData?: StudentProfile) {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
    initialData, // If provided from server, use it (no loading state!)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
