import { create } from "zustand";

interface ChatState {
  activeConversationId: string | null;
  globalUnreadCount: number;

  setActiveConversationId: (id: string | null) => void;
  setGlobalUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

const initialState = {
  activeConversationId: null,
  globalUnreadCount: 0,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),
  setGlobalUnreadCount: (globalUnreadCount) => set({ globalUnreadCount }),
  incrementUnreadCount: () =>
    set((state) => ({ globalUnreadCount: state.globalUnreadCount + 1 })),
  decrementUnreadCount: () =>
    set((state) => ({
      globalUnreadCount: Math.max(0, state.globalUnreadCount - 1),
    })),
}));
