import axios from 'axios';
import {
  createEmployeeRequestSchema,
  createEmployeeResponseSchema,
  type CreateEmployeeRequest,
  type CreateEmployeeResponse,
} from '@hr-portal/auth-contracts';

const gatewayBaseUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: gatewayBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hrApi = {
  async createEmployee(input: CreateEmployeeRequest, accessToken: string): Promise<CreateEmployeeResponse> {
    const payload = createEmployeeRequestSchema.parse(input);
    const response = await api.post('/hr/employees', payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return createEmployeeResponseSchema.parse(response.data);
  },
};