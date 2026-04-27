"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/lib/types/chat";
import { useChatStore } from "@/lib/stores/chat-store";

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data as Message[];
}

export function useMessages(conversationId: string, initialData?: Message[]) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { activeConversationId, incrementUnreadCount } = useChatStore();

  const query = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
    initialData,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`realtime:messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Update the localized messages cache safely
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old) => {
              if (!old) return [newMessage];
              // Avoid duplicates if optimistic update already added it
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            },
          );

          // Optionally invalidate conversations to update the "last message"
          queryClient.invalidateQueries({ queryKey: ["conversations"] });

          // If message is from someone else and this chat isn't currently open, update unread count
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && newMessage.sender_id !== user.id) {
            if (activeConversationId !== conversationId) {
              incrementUnreadCount();
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          // E.g. message getting marked as read
          queryClient.setQueryData<Message[]>(
            ["messages", conversationId],
            (old) => {
              if (!old) return [updatedMessage];
              return old.map((m) =>
                m.id === updatedMessage.id ? updatedMessage : m,
              );
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    conversationId,
    queryClient,
    supabase,
    activeConversationId,
    incrementUnreadCount,
  ]);

  return query;
}
