import { prisma } from '../lib/prisma.js';

export const documentChunkRepository = {
  deleteManyByDocumentId(documentId: string) {
    return prisma.documentChunk.deleteMany({
      where: { documentId },
    });
  },

  createMany(documentId: string, chunks: Array<{ chunkIndex: number; content: string }>) {
    return prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      })),
    });
  },
};
