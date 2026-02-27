import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types/listing";

export function useNotifications(userId: string | null) {
  return useQuery<Notification[]>({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUnreadNotificationCount(userId: string | null) {
  const { data } = useNotifications(userId);
  return data?.filter((n) => !n.read).length ?? 0;
}
