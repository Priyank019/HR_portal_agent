import { unlink } from 'node:fs/promises';
import { notFound } from '../errors/http-error.js';
import { documentRepository } from '../repositories/document.repository.js';
import { getDocumentFilePath } from '../utils/document-files.js';

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

    const filePath = getDocumentFilePath(existingDocument.storagePath);

    try {
      await unlink(filePath);
    } catch (error: unknown) {
      const fileSystemError = error as NodeJS.ErrnoException | undefined;

      if (fileSystemError?.code !== 'ENOENT') {
        throw error;
      }
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
