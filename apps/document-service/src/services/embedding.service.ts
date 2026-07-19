import { GoogleGenAI } from '@google/genai';

// const embeddingModel = 'text-embedding-004';

export type EmbeddingVector = number[];

const getEmbeddingClient = () => {
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
  const embeddingApiKey = process.env.GEMINI_API_KEY;

  if (!embeddingApiKey) {
    throw new Error('GEMINI_API_KEY is required for embedding generation');
  }

  return new GoogleGenAI({
    apiKey: embeddingApiKey,
  });
};

const normalizeChunkText = (chunkText: string) => chunkText.trim();

const extractEmbeddingVector = (values?: number[]) => {
  if (!values || values.length === 0) {
    throw new Error('Embedding response did not include vector values');
  }

  return values;
};

export const embeddingService = {
  async generateEmbedding(chunkText: string): Promise<EmbeddingVector> {
    const normalizedChunkText = normalizeChunkText(chunkText);

    if (!normalizedChunkText) {
      throw new Error('chunkText is required');
    }

    const ai = getEmbeddingClient();
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: normalizedChunkText,
      config: {
        outputDimensionality: 768,
      },
    });

    return extractEmbeddingVector(response.embeddings?.[0]?.values);
  },

  async generateEmbeddings(chunkTexts: string[]): Promise<EmbeddingVector[]> {
    const normalizedChunkTexts = chunkTexts.map(normalizeChunkText).filter(Boolean);

    if (normalizedChunkTexts.length === 0) {
      return [];
    }

    const ai = getEmbeddingClient();
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: normalizedChunkTexts,
      config: {
        outputDimensionality: 768,
      },
    
    });

    return (response.embeddings ?? []).map((embedding) => extractEmbeddingVector(embedding.values));
  },
};
