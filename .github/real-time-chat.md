# Real-Time Chat Feature Plan

We will implement a complete real-time messaging system using Supabase websockets to allow students (tenants) and listers to communicate privately.

## Phases

### Phase 1: Database & RLS Setup

1. Create `conversations` table fields (`id`, `student_id`, `lister_id`, `listing_id`, `created_at`, `updated_at`).
2. Create `messages` table fields (`id`, `conversation_id`, `sender_id`, `content`, `read_at`, `created_at`).
3. Set up Foreign Keys mapping to `auth.users` and `listings`.
4. Enable RLS and add policies: users can only read/insert if they are part of the conversation.
5. Enable Supabase Realtime for the `messages` table.

### Phase 2: Hooks & Global State (React Query / Zustand)

1. Create `use-conversations.ts` to fetch all chats for a user (with latest message and unread count).
2. Create `use-messages.ts` for fetching messages of a specific conversation and subscribing to real-time inserts via Supabase `.on('postgres_changes', ...)`.
3. Create a Zustand store `chat-store.ts` to manage global unread counts and track the currently open conversation ID to automatically mark new messages as read.

### Phase 3: Initialization & Entry Points

1. Update listing details (e.g., `listing-card.tsx`) to implement the "Dorm Chat" button.
2. Create server action / mutation `use-init-chat.ts` to create or fetch an existing conversation when "Dorm Chat" is clicked, then redirect to the chat page (`/dashboard/chats/[id]`).

### Phase 4: Global Badges & Layout Integration

1. Add real-time unread badges to `components/dashboard/sidebar.tsx` and `components/lister/lister-sidebar.tsx`.
2. Add real-time badges to headers: `student-nav-header.tsx` and `lister-dashboard-header.tsx`.

### Phase 5: Chat UI & Interactivity

1. Build `chat-sidebar.tsx` showing the list of conversations + individual unread counters.
2. Build `chat-window.tsx`: message history, auto-scroll-to-bottom, "typing" indicators.
3. Build `message-input.tsx`: text area with send button, handling optimistic UI updates.
4. Implement automatic `read_at` updating when viewing a chat.

## Relevant Files

- `supabase/migrations/*_chat_tables.sql` — Add tables and RLS policies.
- `app/dashboard/chats/page.tsx` & `app/lister/chats/page.tsx` — Main chat views.
- `components/dashboard/sidebar.tsx` & `components/lister/lister-sidebar.tsx` — Location of unread badges.
- `hooks/use-messages.ts` — Location for Realtime subscription logic.

## Verification

1. Verify RLS: Ensure student A cannot read student B's conversations in the Supabase logs.
2. Verify Realtime: Open lister and student views side-by-side; send a message and verify it appears instantly on the other side.
3. Verify Badge Logic: Ensure the unread count increases on new messages and resets to 0 when the conversation layout is opened.

## Decisions

- Conversations will be linked to a specific `listing_id` to provide context to the lister on which property the student is asking about.
- Real-time subscriptions will use Supabase Postgres Changes strictly on the `messages` table.
