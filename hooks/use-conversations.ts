"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Conversation, Message } from "@/lib/types/chat";

async function fetchConversations(): Promise<Conversation[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch conversations where the user is either the student or the lister
  const { data: conversationsData, error: conversationsError } = await supabase
    .from("conversations")
    .select(
      `
      *,
      student:student_profiles!student_id(full_name, avatar_url),
      lister:lister_profiles!lister_id(full_name, avatar_url),
      listing:listings(title)
    `,
    )
    .or(`student_id.eq.${user.id},lister_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (conversationsError) {
    console.error("Error fetching conversations:", conversationsError);
    return [];
  }

  // To properly get unread counts and last message, we need to query messages
  // We'll batch this by grabbing the conversation IDs
  const conversationIds = conversationsData.map((c) => c.id);

  if (conversationIds.length === 0) return [];

  // Fetch all messages for these conversations to calculate unread counts and last message
  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("Error fetching messages for conversations:", messagesError);
  }

  const messages = (messagesData as Message[]) || [];

  // Attach last_message and unread_count
  const enrichedConversations = conversationsData.map((conv) => {
    // Array properties workaround for Supabase joins (sometimes returned as arrays)
    const student = Array.isArray(conv.student)
      ? conv.student[0]
      : conv.student;
    const lister = Array.isArray(conv.lister) ? conv.lister[0] : conv.lister;
    const listing = Array.isArray(conv.listing)
      ? conv.listing[0]
      : conv.listing;

    const convMessages = messages.filter((m) => m.conversation_id === conv.id);
    const lastMessage = convMessages[0]; // Already ordered by created_at desc

    const unreadCount = convMessages.filter(
      (m) => m.sender_id !== user.id && m.read_at === null,
    ).length;

    return {
      ...conv,
      student,
      lister,
      listing,
      last_message: lastMessage,
      unread_count: unreadCount,
    };
  });

  return enrichedConversations as Conversation[];
}

export function useConversations(initialData?: Conversation[]) {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    initialData,
    staleTime: 1000 * 60, // 1 minute
  });
}
