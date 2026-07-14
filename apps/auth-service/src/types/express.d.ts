import type { AuthUser } from '@hr-portal/auth-contracts';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};