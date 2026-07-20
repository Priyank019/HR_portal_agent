import { create } from 'zustand';
import type { ChatResponse, ChatSource } from '../lib/chat-api';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
  isError?: boolean;
  sources?: ChatSource[];
  similarityScores?: number[];
  retrievedChunkCount?: number;
};

export type Conversation = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

type QueueQuestionResult = {
  assistantMessageId: string;
};

type ChatState = {
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: ChatMessage[];
  conversationMessagesById: Record<string, ChatMessage[]>;
  restoredUserId: string | null;
  hydrateConversations: (conversations: Conversation[], userId: string) => void;
  clearState: () => void;
  resetForNewChat: () => void;
  setActiveConversation: (conversationId: string | null) => void;
  upsertConversation: (conversation: Conversation) => void;
  setConversationMessages: (conversationId: string, messages: ChatMessage[]) => void;
  queueQuestion: (conversationId: string, question: string) => QueueQuestionResult;
  applyAssistantResponse: (conversationId: string, assistantMessageId: string, response: ChatResponse) => void;
  finalizeAssistantMessage: (conversationId: string, assistantMessageId: string) => void;
  failAssistantMessage: (conversationId: string, assistantMessageId: string, errorMessage: string) => void;
};

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getConversationPreview = (messages: ChatMessage[]) => {
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    return 'Start a new conversation';
  }

  if (lastMessage.text.trim().length > 0) {
    return lastMessage.text;
  }

  return lastMessage.role === 'assistant' ? 'Thinking...' : 'New message';
};

const sortConversations = (conversations: Conversation[]) =>
  [...conversations].sort((left, right) => right.updatedAt - left.updatedAt);

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  conversations: [],
  messages: [],
  conversationMessagesById: {},
  restoredUserId: null,
  hydrateConversations: (conversations, userId) => {
    set((state) => {
      const preservedMessages = Object.fromEntries(
        conversations
          .filter((conversation) => state.conversationMessagesById[conversation.id])
          .map((conversation) => [conversation.id, state.conversationMessagesById[conversation.id]]),
      );

      return {
        activeConversationId: null,
        conversations: sortConversations(conversations),
        messages: [],
        conversationMessagesById: preservedMessages,
        restoredUserId: userId,
      };
    });
  },
  clearState: () => {
    set({
      activeConversationId: null,
      conversations: [],
      messages: [],
      conversationMessagesById: {},
      restoredUserId: null,
    });
  },
  resetForNewChat: () => {
    set({
      activeConversationId: null,
      messages: [],
    });
  },
  setActiveConversation: (conversationId) => {
    const state = get();

    set({
      activeConversationId: conversationId,
      messages: conversationId ? state.conversationMessagesById[conversationId] ?? [] : [],
    });
  },
  upsertConversation: (conversation) => {
    set((state) => ({
      conversations: sortConversations([
        conversation,
        ...state.conversations.filter((currentConversation) => currentConversation.id !== conversation.id),
      ]),
    }));
  },
  setConversationMessages: (conversationId, messages) => {
    set((state) => ({
      activeConversationId: conversationId,
      messages,
      conversationMessagesById: {
        ...state.conversationMessagesById,
        [conversationId]: messages,
      },
    }));
  },
  queueQuestion: (conversationId, question) => {
    const assistantMessageId = createId();
    const userMessageId = createId();
    const timestamp = Date.now();

    set((current) => {
      const currentMessages = current.conversationMessagesById[conversationId] ?? [];
      const nextMessages: ChatMessage[] = [
        ...currentMessages,
        { id: userMessageId, role: 'user', text: question },
        {
          id: assistantMessageId,
          role: 'assistant',
          text: '',
          isStreaming: true,
          sources: [],
          similarityScores: [],
          retrievedChunkCount: 0,
        },
      ];

      return {
        activeConversationId: conversationId,
        conversations: sortConversations(
          current.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  title: currentMessages.length === 0 ? question.slice(0, 48) : conversation.title,
                  preview: getConversationPreview(nextMessages),
                  updatedAt: timestamp,
                }
              : conversation,
          ),
        ),
        messages: current.activeConversationId === conversationId ? nextMessages : current.messages,
        conversationMessagesById: {
          ...current.conversationMessagesById,
          [conversationId]: nextMessages,
        },
      };
    });

    return { assistantMessageId };
  },
  applyAssistantResponse: (conversationId, assistantMessageId, response) => {
    set((state) => {
      const currentMessages = state.conversationMessagesById[conversationId] ?? [];
      const nextMessages = currentMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              text: response.answer,
              isStreaming: true,
              sources: response.sources,
              similarityScores: response.similarityScores,
              retrievedChunkCount: response.retrievedChunkCount,
            }
          : message,
      );

      return {
        conversations: sortConversations(
          state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  preview: getConversationPreview(nextMessages),
                  updatedAt: Date.now(),
                }
              : conversation,
          ),
        ),
        messages: state.activeConversationId === conversationId ? nextMessages : state.messages,
        conversationMessagesById: {
          ...state.conversationMessagesById,
          [conversationId]: nextMessages,
        },
      };
    });
  },
  finalizeAssistantMessage: (conversationId, assistantMessageId) => {
    set((state) => {
      const currentMessages = state.conversationMessagesById[conversationId] ?? [];
      const nextMessages = currentMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              isStreaming: false,
            }
          : message,
      );

      return {
        conversations: sortConversations(
          state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  preview: getConversationPreview(nextMessages),
                  updatedAt: Date.now(),
                }
              : conversation,
          ),
        ),
        messages: state.activeConversationId === conversationId ? nextMessages : state.messages,
        conversationMessagesById: {
          ...state.conversationMessagesById,
          [conversationId]: nextMessages,
        },
      };
    });
  },
  failAssistantMessage: (conversationId, assistantMessageId, errorMessage) => {
    set((state) => {
      const currentMessages = state.conversationMessagesById[conversationId] ?? [];
      const nextMessages = currentMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              text: errorMessage,
              isStreaming: false,
              isError: true,
            }
          : message,
      );

      return {
        conversations: sortConversations(
          state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  preview: getConversationPreview(nextMessages),
                  updatedAt: Date.now(),
                }
              : conversation,
          ),
        ),
        messages: state.activeConversationId === conversationId ? nextMessages : state.messages,
        conversationMessagesById: {
          ...state.conversationMessagesById,
          [conversationId]: nextMessages,
        },
      };
    });
  },
}));