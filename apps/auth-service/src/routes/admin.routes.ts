import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const adminRouter = Router();

adminRouter.post('/hr', authenticate, adminController.createHr);