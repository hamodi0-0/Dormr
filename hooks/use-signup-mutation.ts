"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { SignupFormValues } from "@/lib/schemas/signup-schema";

const validateEmailDomain = async (email: string): Promise<boolean> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("is_email_domain_allowed", {
    email_address: email,
  });

  if (error) throw new Error("Could not validate your email domain.");
  return data === true;
};

const signupUser = async (
  values: SignupFormValues,
): Promise<{ requiresConfirmation: boolean }> => {
  const isDomainAllowed = await validateEmailDomain(values.email);
  if (!isDomainAllowed) {
    throw new Error("Please use a valid university email address.");
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { user_type: "student" },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;

  return { requiresConfirmation: Boolean(data.user && !data.session) };
};

export function useSignupMutation() {
  return useMutation({
    mutationFn: signupUser,
  });
}
