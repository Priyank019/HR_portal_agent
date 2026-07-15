import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { loginRequestSchema, refreshTokenRequestSchema, registerRequestSchema } from '@hr-portal/auth-contracts';
import { unauthorized } from '../errors/http-error.js';

const refreshTokenCookieName = 'refreshToken';
const refreshTokenCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/auth',
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = registerRequestSchema.parse(req.body);
      const result = await authService.register(payload);
      setRefreshTokenCookie(res, result.tokens.refreshToken);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    console.log("========== LOGIN ==========");
    console.log(req.body);
    console.log("===========================");
    try {
      const payload = loginRequestSchema.parse(req.body);
      const result = await authService.login(payload);
      setRefreshTokenCookie(res, result.tokens.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieToken = req.cookies?.[refreshTokenCookieName];
      const bodyPayload = refreshTokenRequestSchema.safeParse(req.body);
      const refreshToken = bodyPayload.success ? bodyPayload.data.refreshToken : cookieToken;

      if (!refreshToken) {
        throw unauthorized('Refresh token is required');
      }

      const result = await authService.refresh({ refreshToken });
      setRefreshTokenCookie(res, result.tokens.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieToken = req.cookies?.[refreshTokenCookieName];
      const bodyPayload = refreshTokenRequestSchema.safeParse(req.body);
      const refreshToken = bodyPayload.success ? bodyPayload.data.refreshToken : cookieToken;

      if (!refreshToken) {
        throw unauthorized('Refresh token is required');
      }

      await authService.logout(refreshToken);
      res.clearCookie(refreshTokenCookieName);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw unauthorized('Authentication required');
      }

      const user = await authService.me(req.user.id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },
};