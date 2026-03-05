"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TenantCompatibilityProfile } from "@/lib/types/compatibility";

async function fetchMyProfile(): Promise<TenantCompatibilityProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("student_profiles")
    .select(
      "sleep_schedule, cleanliness, noise_level, guests_frequency, smoking, pets, major, hobbies",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as TenantCompatibilityProfile;
}

export function useStudentProfile() {
  return useQuery<TenantCompatibilityProfile | null>({
    queryKey: ["my-student-profile"],
    queryFn: fetchMyProfile,
    staleTime: 5 * 60 * 1000, // 5 min — profile rarely changes
    gcTime: 10 * 60 * 1000,
  });
}
