import { access } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { badRequest } from '../errors/http-error.js';
import { documentProcessingService } from '../services/document-processing.service.js';
import { documentService } from '../services/document.service.js';
import { getDocumentFilePath } from '../utils/document-files.js';

const documentIdParamsSchema = z.object({
  id: z.string().min(1),
});

const uploadBodySchema = z.object({
  uploadedBy: z.string().min(1),
});

export const documentController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await documentService.listDocuments();
      res.status(200).json({ items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdParamsSchema.parse(req.params);
      const document = await documentService.getDocumentById(id);
      res.status(200).json({ document });
    } catch (error) {
      next(error);
    }
  },

  async view(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdParamsSchema.parse(req.params);
      const document = await documentService.getDocumentById(id);
      const filePath = getDocumentFilePath(document.storagePath);

      await access(filePath);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.originalName.replace(/"/g, '\\"')}"`);
      res.sendFile(filePath, (error) => {
        if (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdParamsSchema.parse(req.params);
      await documentService.deleteDocumentById(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw badRequest('PDF file is required');
      }

      const { uploadedBy } = uploadBodySchema.parse(req.body);
      const createdDocument = await documentService.createUploadedDocument({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath: `uploads/${req.file.filename}`,
        uploadedBy,
      });

      const extractedDocument = await documentProcessingService.processUploadedDocument(createdDocument.id);
      const document = await documentService.getDocumentById(createdDocument.id);

      res.status(201).json({
        document,
        extractedDocument,
      });
    } catch (error) {
      next(error);
    }
  },
};
