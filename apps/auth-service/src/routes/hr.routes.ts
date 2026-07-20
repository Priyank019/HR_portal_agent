import { Router } from 'express';
import { hrController } from '../controllers/hr.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const hrRouter = Router();

hrRouter.post('/employees', authenticate, hrController.createEmployee);