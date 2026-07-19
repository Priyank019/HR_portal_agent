import { HttpError, unauthorized } from '../errors/http-error.js';
import { env } from '../config/env.js';

export type StoredConversationMessage = {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
};

type StoredConversation = {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredConversationMessage[];
};

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return `chat-service request failed with status ${response.status}`;
  }

  const payload = (await response.json()) as { message?: string };
  return payload.message || `chat-service request failed with status ${response.status}`;
};

const ensureAuthorization = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw unauthorized('Bearer token is required to use persistent chat conversations');
  }

  return authorizationHeader;
};

const requestJson = async <T>(path: string, init: RequestInit, authorizationHeader: string): Promise<T> => {
  const response = await fetch(new URL(path, env.CHAT_SERVICE_URL), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorizationHeader,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new HttpError(response.status, await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const chatHistoryService = {
  async saveUserMessage(conversationId: string, content: string, authorizationHeader?: string) {
    await requestJson(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ role: 'USER', content }),
      },
      ensureAuthorization(authorizationHeader),
    );
  },

  async saveAssistantMessage(conversationId: string, content: string, authorizationHeader?: string) {
    await requestJson(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ role: 'ASSISTANT', content }),
      },
      ensureAuthorization(authorizationHeader),
    );
  },

  async getConversation(conversationId: string, authorizationHeader?: string) {
    return requestJson<StoredConversation>(
      `/chat/conversations/${conversationId}`,
      {
        method: 'GET',
      },
      ensureAuthorization(authorizationHeader),
    );
  },
};