import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { documentService } from '../services/document.service.js';

const documentIdParamsSchema = z.object({
  id: z.string().min(1),
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

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdParamsSchema.parse(req.params);
      await documentService.deleteDocumentById(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
