import type { NextFunction, Request, Response } from 'express';
import { authRoleSchema } from '@hr-portal/auth-contracts';
import { unauthorized } from '../errors/http-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorization = req.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw unauthorized('Bearer token is required');
    }

    const token = authorization.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: authRoleSchema.parse(payload.role),
      createdAt: new Date(payload.iat ? payload.iat * 1000 : Date.now()).toISOString(),
      updatedAt: new Date(payload.iat ? payload.iat * 1000 : Date.now()).toISOString(),
    };

    next();
  } catch (error) {
    next(error);
  }
};