import axios from 'axios';

type ChatRequest = {
  question: string;
};

type ChatResponse = {
  answer: string;
};

const gatewayBaseUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: gatewayBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  async ask(question: string): Promise<ChatResponse> {
    const payload: ChatRequest = { question };
    const response = await api.post('/api/chat', payload);
    return response.data as ChatResponse;
  },
};
