import { performance } from 'node:perf_hooks';
import { badRequest } from '../errors/http-error.js';
import { generateContent, generateContentStream } from './gemini.service.js';
import { type SearchResult, searchService } from './search.service.js';

const defaultLimit = 5;

export type RAGSource = {
  documentId: string;
  fileName: string;
  chunkIndex: number;
};

export type RAGResponse = {
  answer: string;
  sources: RAGSource[];
  similarityScores: number[];
  retrievedChunkCount: number;
};

export type RAGStreamEvent =
  | {
      type: 'metadata';
      sources: RAGSource[];
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
    } & RAGResponse);

export type ConversationHistoryMessage = {
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt?: string;
};

type RAGContext = {
  prompt: string;
  retrievedChunks: SearchResult[];
  sources: RAGSource[];
  similarityScores: number[];
  retrievedChunkCount: number;
};

type StreamAnswerOptions = {
  conversationHistory?: ConversationHistoryMessage[];
  beforeComplete?: (response: RAGResponse) => Promise<void> | void;
};

const normalizeQuestion = (question: string) => {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw badRequest('Question is required');
  }

  return normalizedQuestion;
};

const normalizeLimit = (limit?: number) => {
  if (limit === undefined) {
    return defaultLimit;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw badRequest('limit must be a positive integer');
  }

  return limit;
};

const toSource = (chunk: SearchResult): RAGSource => ({
  documentId: chunk.documentId,
  fileName: chunk.fileName,
  chunkIndex: chunk.chunkIndex,
});

const toNdjson = (event: RAGStreamEvent) => `${JSON.stringify(event)}\n`;

export class RAGService {
  async retrieveContext(
    question: string,
    limit = defaultLimit,
    conversationHistory: ConversationHistoryMessage[] = [],
  ): Promise<RAGContext> {
    const normalizedQuestion = normalizeQuestion(question);
    const normalizedLimit = normalizeLimit(limit);
    const retrievedChunks = await searchService.semanticSearch(normalizedQuestion, normalizedLimit);
    const sources = retrievedChunks.map(toSource);
    const similarityScores = retrievedChunks.map((chunk) => chunk.score);

    return {
      prompt: this.buildPrompt(normalizedQuestion, retrievedChunks, conversationHistory),
      retrievedChunks,
      sources,
      similarityScores,
      retrievedChunkCount: retrievedChunks.length,
    };
  }

  buildPrompt(
    question: string,
    retrievedChunks: SearchResult[],
    conversationHistory: ConversationHistoryMessage[] = [],
  ) {
    const normalizedQuestion = normalizeQuestion(question);
    const conversationBlock =
      conversationHistory.length === 0
        ? 'No prior conversation history is available.'
        : conversationHistory
            .map((message, index) => {
              const timestamp = message.createdAt ? ` (${message.createdAt})` : '';
              return `${index + 1}. ${message.role}${timestamp}: ${message.content}`;
            })
            .join('\n');

    const contextBlock =
      retrievedChunks.length === 0
        ? 'No relevant document context was retrieved from the knowledge base.'
        : retrievedChunks
            .map(
              (chunk, index) =>
                [
                  `Context ${index + 1}`,
                  `Source File Name: ${chunk.fileName}`,
                  `Document ID: ${chunk.documentId}`,
                  `Chunk Index: ${chunk.chunkIndex}`,
                  `Similarity Score: ${chunk.score.toFixed(4)}`,
                  'Retrieved Context:',
                  chunk.text,
                ].join('\n'),
            )
            .join('\n\n');

    const sourceFileNames =
      retrievedChunks.length === 0
        ? 'None'
        : Array.from(new Set(retrievedChunks.map((chunk) => chunk.fileName))).join(', ');

    return [
      'You are an HR knowledge assistant.',
      'Answer the question using the retrieved context when it is relevant.',
      'If the context is missing or insufficient, say so clearly and do not invent facts.',
      '',
      'Conversation History:',
      conversationBlock,
      '',
      'Retrieved Context:',
      contextBlock,
      '',
      'Source File Names:',
      sourceFileNames,
      '',
      'Current User Question:',
      normalizedQuestion,
    ].join('\n');
  }

  async generateAnswer(
    question: string,
    limit = defaultLimit,
    conversationHistory: ConversationHistoryMessage[] = [],
  ): Promise<RAGResponse> {
    const startedAt = performance.now();
    const context = await this.retrieveContext(question, limit, conversationHistory);

    try {
      const response = await generateContent(context.prompt);
      const answer = response.text?.trim() ?? '';

      return {
        answer,
        sources: context.sources,
        similarityScores: context.similarityScores,
        retrievedChunkCount: context.retrievedChunkCount,
      };
    } finally {
      const latencyMs = performance.now() - startedAt;
      console.log('RAG answer latency: %dms', Number(latencyMs.toFixed(2)));
    }
  }

  async streamAnswer(
    question: string,
    limit = defaultLimit,
    onEvent?: (event: RAGStreamEvent) => void,
    options: StreamAnswerOptions = {},
  ): Promise<RAGResponse> {
    const startedAt = performance.now();
    const context = await this.retrieveContext(question, limit, options.conversationHistory ?? []);
    let answer = '';

    try {
      onEvent?.({
        type: 'metadata',
        sources: context.sources,
        similarityScores: context.similarityScores,
        retrievedChunkCount: context.retrievedChunkCount,
      });

      const stream = await generateContentStream(context.prompt);

      for await (const chunk of stream) {
        const delta = chunk.text;

        if (!delta) {
          continue;
        }

        answer += delta;
        onEvent?.({
          type: 'answer_delta',
          delta,
          answer,
        });
      }

      const response = {
        answer: answer.trim(),
        sources: context.sources,
        similarityScores: context.similarityScores,
        retrievedChunkCount: context.retrievedChunkCount,
      };

      await options.beforeComplete?.(response);

      onEvent?.({
        type: 'complete',
        ...response,
      });

      return response;
    } finally {
      const latencyMs = performance.now() - startedAt;
      console.log('RAG stream latency: %dms', Number(latencyMs.toFixed(2)));
    }
  }

  serializeEvent(event: RAGStreamEvent) {
    return toNdjson(event);
  }
}

export const ragService = new RAGService();