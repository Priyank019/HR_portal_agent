import { Router } from 'express';
import { documentController } from '../controllers/document.controller.js';

export const documentRouter = Router();

documentRouter.get('/', documentController.list);
documentRouter.get('/:id', documentController.getById);
documentRouter.delete('/:id', documentController.remove);
