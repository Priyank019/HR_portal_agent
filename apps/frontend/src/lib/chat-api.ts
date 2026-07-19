const gatewayBaseUrl =
  import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

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
  async ask(
    question: string,
    onChunk: (response: ChatResponse) => void,
    limit?: number,
  ): Promise<ChatResponse> {
    const response = await fetch(`${gatewayBaseUrl}/api/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        limit,
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