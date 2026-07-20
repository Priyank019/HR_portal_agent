import type { NextFunction, Request, Response } from 'express';
import { createEmployeeRequestSchema } from '@hr-portal/auth-contracts';
import { forbidden, unauthorized } from '../errors/http-error.js';
import { authService } from '../services/auth.service.js';

export const hrController = {
  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw unauthorized('Authentication required');
      }

      if (req.user.role !== 'HR') {
        throw forbidden('You do not have access to this resource');
      }

      const payload = createEmployeeRequestSchema.parse(req.body);
      const employee = await authService.createEmployeeAccount({
        employeeId: payload.employeeId,
        name: payload.name,
        email: payload.email,
        department: payload.department,
        designation: payload.designation,
        password: payload.password,
        createdById: req.user.id,
      });

      res.status(201).json({
        message: 'Employee created successfully',
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          role: 'EMPLOYEE',
        },
      });
    } catch (error) {
      next(error);
    }
  },
};