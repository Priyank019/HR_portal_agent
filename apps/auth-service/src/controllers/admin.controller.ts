import type { NextFunction, Request, Response } from 'express';
import { createHrRequestSchema } from '@hr-portal/auth-contracts';
import { forbidden, unauthorized } from '../errors/http-error.js';
import { authService } from '../services/auth.service.js';

export const adminController = {
  async createHr(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw unauthorized('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw forbidden('You do not have access to this resource');
      }

      const payload = createHrRequestSchema.parse(req.body);
      const user = await authService.createHrAccount({
        employeeId: payload.employeeId,
        name: payload.name,
        email: payload.email,
        department: payload.department,
        designation: payload.designation,
        password: payload.password,
        createdById: req.user.id,
      });

      res.status(201).json({
        message: 'HR account created successfully.',
        user,
      });
    } catch (error) {
      next(error);
    }
  },
};