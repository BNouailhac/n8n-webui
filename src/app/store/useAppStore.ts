import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation } from '../types';

interface AppState {
  // Conversations
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  // First visit flag
  hasVisited: boolean;
  setHasVisited: (visited: boolean) => void;

  // Utility functions
  getCurrentConversation: (id: string | null) => Conversation | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Conversations
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations]
        })),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          )
        })),
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id)
        })),

      // First visit flag
      hasVisited: false,
      setHasVisited: (visited) => set({ hasVisited: visited }),

      // Utility functions
      getCurrentConversation: (id) => {
        if (!id) return undefined;
        return get().conversations.find((conv) => conv.id === id);
      }
    }),
    {
      name: 'ollama-webui-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        hasVisited: state.hasVisited
      })
    }
  )
);