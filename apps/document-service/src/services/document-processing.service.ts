import { notFound } from '../errors/http-error.js';
import { documentChunkRepository } from '../repositories/document-chunk.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { chunkDocumentText } from './chunk.service.js';
import { embeddingService } from './embedding.service.js';
import { qdrantService } from './qdrant.service.js';
import { loadPdfDocuments, type PdfDocumentText } from '../loaders/pdf.loader.js';

export const documentProcessingService = {
  async processUploadedDocument(documentId: string): Promise<PdfDocumentText | null> {
    const document = await documentRepository.findById(documentId);

    if (!document) {
      throw notFound('Document not found');
    }

    await documentRepository.updateStatus(documentId, 'PROCESSING');

    try {
      const [processedDocument] = await loadPdfDocuments([
        {
          documentId: document.id,
          fileName: document.originalName,
          storagePath: document.storagePath,
        },
      ]);

      if (!processedDocument) {
        throw new Error('Failed to extract PDF text');
      }

      const chunkedText = chunkDocumentText(processedDocument.text).map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
        content: chunk.text,
      }));

      await documentChunkRepository.deleteManyByDocumentId(documentId);
      await documentChunkRepository.createMany(documentId, chunkedText);

      const savedChunks = await documentChunkRepository.findManyByDocumentId(documentId);
      const embeddings = await embeddingService.generateEmbeddings(savedChunks.map((chunk) => chunk.content));

      if (embeddings.length !== savedChunks.length) {
        throw new Error('Embedding generation did not return a vector for every chunk');
      }

      await qdrantService.upsertChunks(
        savedChunks.map((chunk, index) => ({
          documentId: document.id,
          fileName: document.originalName,
          chunkId: chunk.id,
          chunkIndex: chunk.chunkIndex,
          text: chunk.content,
          vector: embeddings[index],
        })),
      );

      await documentRepository.updateStatus(documentId, 'PROCESSED');

      return processedDocument;
    } catch (error) {
      await documentRepository.updateStatus(documentId, 'FAILED');
      console.error('Failed to extract PDF text for document %s', documentId, error);
      return null;
    }
  },
};
