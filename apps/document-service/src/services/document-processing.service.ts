import { notFound } from '../errors/http-error.js';
import { documentRepository } from '../repositories/document.repository.js';
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

      await documentRepository.updateStatus(documentId, 'PROCESSED');

      return processedDocument ?? null;
    } catch (error) {
      await documentRepository.updateStatus(documentId, 'FAILED');
      console.error('Failed to extract PDF text for document %s', documentId, error);
      return null;
    }
  },
};
