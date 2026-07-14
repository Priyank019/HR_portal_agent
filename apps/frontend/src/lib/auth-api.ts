import axios from 'axios';
import {
  authResponseSchema,
  loginRequestSchema,
  meResponseSchema,
  registerRequestSchema,
  refreshTokenRequestSchema,
  type AuthResponse,
  type LoginRequest,
  type MeResponse,
  type RefreshTokenRequest,
  type RegisterRequest,
} from '@hr-portal/auth-contracts';

const gatewayBaseUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: gatewayBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  async login(input: LoginRequest): Promise<AuthResponse> {
    const payload = loginRequestSchema.parse(input);
    const response = await api.post('/auth/login', payload);
    return authResponseSchema.parse(response.data);
  },

  async register(input: RegisterRequest): Promise<AuthResponse> {
    const payload = registerRequestSchema.parse(input);
    const response = await api.post('/auth/register', payload);
    return authResponseSchema.parse(response.data);
  },

  async refresh(input?: RefreshTokenRequest): Promise<AuthResponse> {
    const payload = input ? refreshTokenRequestSchema.parse(input) : undefined;
    const response = await api.post('/auth/refresh', payload ?? {});
    return authResponseSchema.parse(response.data);
  },

  async logout(input?: RefreshTokenRequest): Promise<{ success: boolean }> {
    const payload = input ? refreshTokenRequestSchema.parse(input) : undefined;
    const response = await api.post('/auth/logout', payload ?? {});
    return response.data as { success: boolean };
  },

  async me(): Promise<MeResponse> {
    const response = await api.get('/auth/me');
    return meResponseSchema.parse(response.data);
  },
};
