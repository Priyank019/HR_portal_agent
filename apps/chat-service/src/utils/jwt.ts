import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthRole } from '@hr-portal/auth-contracts';

type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: AuthRole;
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;