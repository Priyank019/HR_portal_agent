import axios from 'axios';
import {
  createHrRequestSchema,
  createHrResponseSchema,
  type CreateHrRequest,
  type CreateHrResponse,
} from '@hr-portal/auth-contracts';

const gatewayBaseUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: gatewayBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = {
  async createHr(input: CreateHrRequest, accessToken: string): Promise<CreateHrResponse> {
    const payload = createHrRequestSchema.parse(input);
    const response = await api.post('/admin/hr', payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return createHrResponseSchema.parse(response.data);
  },
};