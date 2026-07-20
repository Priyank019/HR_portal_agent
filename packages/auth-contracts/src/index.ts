import { z } from 'zod';

export const authRoleSchema = z.enum(['EMPLOYEE', 'HR', 'ADMIN']);

export const registerRequestSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('A valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: authRoleSchema.optional().default('EMPLOYEE'),
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

const securePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');

export const createHrRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('A valid email address is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  password: securePasswordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createHrResponseSchema = z.object({
  message: z.literal('HR account created successfully.'),
  user: z.object({
    id: z.string(),
    employeeId: z.string().nullable(),
    name: z.string(),
    email: z.string().email(),
    role: z.literal('HR'),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const createEmployeeRequestSchema = createHrRequestSchema;

export const createEmployeeResponseSchema = z.object({
  message: z.literal('Employee created successfully'),
  employee: z.object({
    id: z.string(),
    employeeId: z.string().nullable(),
    name: z.string(),
    email: z.string().email(),
    role: z.literal('EMPLOYEE'),
  }),
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
export type CreateHrRequest = z.infer<typeof createHrRequestSchema>;
export type CreateHrResponse = z.infer<typeof createHrResponseSchema>;
export type CreateEmployeeRequest = z.infer<typeof createEmployeeRequestSchema>;
export type CreateEmployeeResponse = z.infer<typeof createEmployeeResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;