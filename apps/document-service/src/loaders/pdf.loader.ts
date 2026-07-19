import { readFile } from 'node:fs/promises';
import pdfParse from 'pdf-parse';
import { getDocumentFilePath } from '../utils/document-files.js';

export type PdfDocumentSource = {
  documentId: string;
  fileName: string;
  storagePath: string;
};

export type PdfDocumentText = {
  documentId: string;
  fileName: string;
  text: string;
};

export const loadPdfDocuments = async (
  documents: PdfDocumentSource[],
): Promise<PdfDocumentText[]> => {
  const results = await Promise.all(
    documents.map(async (document) => {
      const filePath = getDocumentFilePath(document.storagePath);
      const fileBuffer = await readFile(filePath);
      const parsed = await pdfParse(fileBuffer);

      return {
        documentId: document.documentId,
        fileName: document.fileName,
        text: parsed.text,
      };
    }),
  );

  return results;
};
