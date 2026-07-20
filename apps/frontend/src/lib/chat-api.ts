const gatewayBaseUrl =
  import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

type ChatRequestOptions = {
  accessToken?: string | null;
  conversationId?: string;
};

export type ChatConversationMessage = {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatConversationMessage[];
};

export type ChatSource = {
  documentId: string;
  fileName: string;
  chunkIndex: number;
};

export type ChatResponse = {
  answer: string;
  sources: ChatSource[];
  similarityScores: number[];
  retrievedChunkCount: number;
};

type ChatStreamEvent =
  | {
      type: 'metadata';
      sources: ChatSource[];
      similarityScores: number[];
      retrievedChunkCount: number;
    }
  | {
      type: 'answer_delta';
      delta: string;
      answer: string;
    }
  | ({
      type: 'complete';
    } & ChatResponse);

export const chatApi = {
  async listConversations(accessToken: string): Promise<{ items: ChatConversation[] }> {
    const response = await fetch(`${gatewayBaseUrl}/chat/conversations`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load conversations');
    }

    return (await response.json()) as { items: ChatConversation[] };
  },

  async getConversation(conversationId: string, accessToken: string): Promise<ChatConversation> {
    const response = await fetch(`${gatewayBaseUrl}/chat/conversations/${conversationId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load conversation');
    }

    return (await response.json()) as ChatConversation;
  },

  async createConversation(accessToken: string, title?: string): Promise<ChatConversation> {
    const response = await fetch(`${gatewayBaseUrl}/chat/conversations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(title ? { title } : {}),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return (await response.json()) as ChatConversation;
  },

  async ask(
    question: string,
    onChunk: (response: ChatResponse) => void,
    limit?: number,
    options?: ChatRequestOptions,
  ): Promise<ChatResponse> {
    const response = await fetch(`${gatewayBaseUrl}/api/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: JSON.stringify({
        question,
        limit,
        conversationId: options?.conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    if (!response.body) {
      throw new Error('Streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const currentResponse: ChatResponse = {
      answer: '',
      sources: [],
      similarityScores: [],
      retrievedChunkCount: 0,
    };

    const handleEvent = (event: ChatStreamEvent) => {
      if (event.type === 'metadata') {
        currentResponse.sources = event.sources;
        currentResponse.similarityScores = event.similarityScores;
        currentResponse.retrievedChunkCount = event.retrievedChunkCount;
        onChunk({ ...currentResponse, sources: [...currentResponse.sources], similarityScores: [...currentResponse.similarityScores] });
        return;
      }

      if (event.type === 'answer_delta') {
        currentResponse.answer = event.answer;
        onChunk({ ...currentResponse, sources: [...currentResponse.sources], similarityScores: [...currentResponse.similarityScores] });
        return;
      }

      currentResponse.answer = event.answer;
      currentResponse.sources = event.sources;
      currentResponse.similarityScores = event.similarityScores;
      currentResponse.retrievedChunkCount = event.retrievedChunkCount;
      onChunk({ ...currentResponse, sources: [...currentResponse.sources], similarityScores: [...currentResponse.similarityScores] });
    };

    const flushBuffer = () => {
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        handleEvent(JSON.parse(trimmedLine) as ChatStreamEvent);
      }
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      flushBuffer();
    }

    buffer += decoder.decode();
    flushBuffer();

    return {
      answer: currentResponse.answer,
      sources: [...currentResponse.sources],
      similarityScores: [...currentResponse.similarityScores],
      retrievedChunkCount: currentResponse.retrievedChunkCount,
    };
  },
};