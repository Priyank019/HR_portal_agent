import { GoogleGenAI } from '@google/genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { performance } from 'node:perf_hooks';
import { badRequest } from '../errors/http-error.js';
import { env } from '../config/env.js';

const defaultLimit = 5;
const embeddingModel = 'gemini-embedding-2';

type SearchPayload = {
  documentId?: unknown;
  fileName?: unknown;
  chunkIndex?: unknown;
  text?: unknown;
};

type SearchResultPayload = {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  text: string;
};

export type SearchResult = {
  text: string;
  score: number;
  documentId: string;
  fileName: string;
  chunkIndex: number;
};

let embeddingClient: GoogleGenAI | null = null;
let qdrantClient: QdrantClient | null = null;

const getEmbeddingClient = () => {
  if (!embeddingClient) {
    embeddingClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }

  return embeddingClient;
};

const getQdrantClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: env.QDRANT_URL,
      apiKey: env.QDRANT_API_KEY,
    });
  }

  return qdrantClient;
};

const isSearchResultPayload = (payload: SearchPayload): payload is SearchResultPayload => {
  return (
    typeof payload.documentId === 'string' &&
    typeof payload.fileName === 'string' &&
    typeof payload.chunkIndex === 'number' &&
    typeof payload.text === 'string'
  );
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

const collectionExists = async () => {
  const qdrant = getQdrantClient();
  const response = await qdrant.getCollections();
  return response.collections.some((collection: { name: string }) => collection.name === env.QDRANT_COLLECTION);
};

export class SearchService {
  async generateQueryEmbedding(question: string) {
    const normalizedQuestion = question.trim();

    if (!normalizedQuestion) {
      throw badRequest('Question is required');
    }

    const ai = getEmbeddingClient();
    const response = await ai.models.embedContent({
      model: embeddingModel,
      contents: normalizedQuestion,
      config: {
            outputDimensionality: env.EMBEDDING_DIMENSION,
        },
    });

    const values = response.embeddings?.[0]?.values;

    if (!values || values.length === 0) {
      throw new Error('Embedding response did not include vector values');
    }

    if (values.length !== env.EMBEDDING_DIMENSION) {
      console.warn(
        'Query embedding dimension mismatch. Expected %d, received %d',
        env.EMBEDDING_DIMENSION,
        values.length,
      );
    }

    return values;
  }

  async searchTopK(queryEmbedding: number[], limit = defaultLimit): Promise<SearchResult[]> {
    const normalizedLimit = normalizeLimit(limit);

    if (queryEmbedding.length === 0) {
      return [];
    }

    if (!(await collectionExists())) {
      return [];
    }

    const qdrant = getQdrantClient();
    const matches = await qdrant.search(env.QDRANT_COLLECTION, {
      vector: queryEmbedding,
      limit: normalizedLimit,
      with_payload: true,
      with_vector: false,
    });

    if (matches.length === 0) {
      return [];
    }

    return matches.flatMap((match) => {
      const payload = (match.payload ?? {}) as SearchPayload;

      if (!isSearchResultPayload(payload)) {
        return [];
      }

      return [
        {
          text: payload.text,
          score: match.score,
          documentId: payload.documentId,
          fileName: payload.fileName,
          chunkIndex: payload.chunkIndex,
        },
      ];
    });
  }

  async semanticSearch(question: string, limit = defaultLimit): Promise<SearchResult[]> {
    const startedAt = performance.now();

    try {
      const queryEmbedding = await this.generateQueryEmbedding(question);
      return await this.searchTopK(queryEmbedding, limit);
    } finally {
      const latencyMs = performance.now() - startedAt;
      console.log('Semantic search latency: %dms', Number(latencyMs.toFixed(2)));
    }
  }
}

export const searchService = new SearchService();