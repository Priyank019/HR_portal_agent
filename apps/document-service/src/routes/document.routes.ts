import { Router } from 'express';
import { documentController } from '../controllers/document.controller.js';
import { uploadSinglePdf } from '../middleware/upload.middleware.js';

export const documentRouter = Router();

documentRouter.post('/upload', uploadSinglePdf, documentController.upload);
documentRouter.get('/', documentController.list);
documentRouter.get('/:id', documentController.getById);
documentRouter.delete('/:id', documentController.remove);
