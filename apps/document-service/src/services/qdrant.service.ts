import { QdrantClient } from '@qdrant/js-client-rest';
import { env } from '../config/env.js';

const collectionName = 'hr_documents';

type QdrantChunkInput = {
  documentId: string;
  fileName: string;
  chunkId: string;
  chunkIndex: number;
  text: string;
  vector: number[];
};

let client: QdrantClient | null = null;
let initializationPromise: Promise<void> | null = null;

const getClient = () => {
  if (!client) {
    client = new QdrantClient({
      url: env.QDRANT_URL,
      apiKey: env.QDRANT_API_KEY,
    });
  }

  return client;
};

const getCollectionNames = async () => {
  const qdrant = getClient();
  const response = await qdrant.getCollections();
  return response.collections.map((collection: { name: string }) => collection.name);
};

const getPointId = (documentId: string, chunkIndex: number) => `${documentId}:${chunkIndex}`;

export const qdrantService = {
  async initialize() {
    if (!initializationPromise) {
      initializationPromise = this.createCollectionIfNotExists().catch((error) => {
        initializationPromise = null;
        throw error;
      });
    }

    return initializationPromise;
  },

  async collectionExists() {
    const collectionNames = await getCollectionNames();
    return collectionNames.includes(collectionName);
  },

  async createCollectionIfNotExists() {
    const qdrant = getClient();
    const exists = await this.collectionExists();

    if (exists) {
      console.log('Collection already exists');
      console.log('Connected to Qdrant');
      return;
    }

    await qdrant.createCollection(collectionName, {
      vectors: {
        size: env.EMBEDDING_DIMENSION,
        distance: 'Cosine',
      },
    });

    console.log('Connected to Qdrant');
    console.log('Collection created');
  },

  async upsertChunks(documentChunks: QdrantChunkInput[]) {
    await this.initialize();

    console.log('Indexing started');

    if (documentChunks.length === 0) {
      console.log('Indexing completed');
      console.log('Number of indexed chunks: 0');
      return 0;
    }

    const qdrant = getClient();
    await qdrant.upsert(collectionName, {
      wait: true,
      points: documentChunks.map((chunk) => ({
        id: getPointId(chunk.documentId, chunk.chunkIndex),
        vector: chunk.vector,
        payload: {
          documentId: chunk.documentId,
          chunkId: chunk.chunkId,
          fileName: chunk.fileName,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
        },
      })),
    });

    console.log('Indexing completed');
    console.log(`Number of indexed chunks: ${documentChunks.length}`);

    return documentChunks.length;
  },

  async deleteDocument(documentId: string) {
    const qdrant = getClient();
    await qdrant.delete(collectionName, {
      wait: true,
      filter: {
        must: [
          {
            key: 'documentId',
            match: {
              value: documentId,
            },
          },
        ],
      },
    });
  },
};
