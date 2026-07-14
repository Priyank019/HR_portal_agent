import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthRole, AuthUser } from '@hr-portal/auth-contracts';

type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: AuthRole;
};

type RefreshTokenPayload = {
  sub: string;
  tokenType: 'refresh';
  jti: string;
};

export const generateTokenPair = (user: AuthUser) => {
  const accessPayload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const jti = crypto.randomUUID();
  const refreshPayload: RefreshTokenPayload = {
    sub: user.id,
    tokenType: 'refresh',
    jti,
  };

  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  };

  const refreshTokenOptions: jwt.SignOptions = {
    expiresIn: env.JWT_REFRESH_TTL as jwt.SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, accessTokenOptions);

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, refreshTokenOptions);

  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_TTL,
  };
};

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload & jwt.JwtPayload;

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');