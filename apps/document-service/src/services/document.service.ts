import { notFound } from '../errors/http-error.js';
import { documentRepository } from '../repositories/document.repository.js';

export const documentService = {
  listDocuments() {
    return documentRepository.findMany();
  },

  async getDocumentById(id: string) {
    const document = await documentRepository.findById(id);

    if (!document) {
      throw notFound('Document not found');
    }

    return document;
  },

  async deleteDocumentById(id: string) {
    const existingDocument = await documentRepository.findById(id);

    if (!existingDocument) {
      throw notFound('Document not found');
    }

    await documentRepository.deleteById(id);
  },

  createUploadedDocument(input: {
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    uploadedBy: string;
  }) {
    return documentRepository.create({
      ...input,
      status: 'UPLOADED',
    });
  },
};
