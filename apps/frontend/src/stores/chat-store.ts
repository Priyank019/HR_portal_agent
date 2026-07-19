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
  conversationId: string;
};

type ChatState = {
  activeConversationId: string;
  conversations: Conversation[];
  messages: ChatMessage[];
  conversationMessagesById: Record<string, ChatMessage[]>;
  createConversation: () => string;
  setActiveConversation: (conversationId: string) => void;
  queueQuestion: (question: string) => QueueQuestionResult;
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

const createConversationRecord = (): Conversation => ({
  id: createId(),
  title: 'New chat',
  preview: 'Start a new conversation',
  updatedAt: Date.now(),
});

const initialConversation = createConversationRecord();

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: initialConversation.id,
  conversations: [initialConversation],
  messages: [],
  conversationMessagesById: {
    [initialConversation.id]: [],
  },
  createConversation: () => {
    const conversation = createConversationRecord();

    set((state) => ({
      activeConversationId: conversation.id,
      conversations: sortConversations([conversation, ...state.conversations]),
      messages: [],
      conversationMessagesById: {
        ...state.conversationMessagesById,
        [conversation.id]: [],
      },
    }));

    return conversation.id;
  },
  setActiveConversation: (conversationId: string) => {
    const state = get();

    if (!state.conversationMessagesById[conversationId]) {
      return;
    }

    set({
      activeConversationId: conversationId,
      messages: state.conversationMessagesById[conversationId],
    });
  },
  queueQuestion: (question: string) => {
    const assistantMessageId = createId();
    const userMessageId = createId();
    const timestamp = Date.now();
    const state = get();
    const conversationId = state.activeConversationId;

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

    return { assistantMessageId, conversationId };
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