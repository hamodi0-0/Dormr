"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const uploadAvatar = async (file: File): Promise<void> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are supported.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be under 2 MB.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.type.split("/")[1];
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("student_profiles")
    .update({
      avatar_url: urlWithCacheBust,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) throw updateError;
};

const removeAvatar = async (): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Remove all common extensions — we don't know which one was uploaded
  await supabase.storage
    .from(BUCKET)
    .remove([
      `${user.id}/avatar.jpeg`,
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.webp`,
    ]);

  const { error } = await supabase
    .from("student_profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw error;
};

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["student-profile"] });

  const upload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: removeAvatar,
    onSuccess: invalidate,
  });

  return { upload, remove };
}
