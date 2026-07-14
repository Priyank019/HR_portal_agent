import { z } from 'zod';

export const authRoleSchema = z.enum(['Employee', 'HR', 'Admin']);

export const registerRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: authRoleSchema.optional().default('Employee'),
});

export const loginRequestSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: authRoleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  tokens: tokenPairSchema,
});

export const meResponseSchema = z.object({
  user: authUserSchema,
});

export type AuthRole = z.infer<typeof authRoleSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type TokenPair = z.infer<typeof tokenPairSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;