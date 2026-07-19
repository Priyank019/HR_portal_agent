import axios from 'axios';

export type DocumentItem = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

const gatewayBaseUrl = import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: gatewayBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentApi = {
  async listDocuments(): Promise<{ items: DocumentItem[] }> {
    const response = await api.get('/documents');
    return response.data as { items: DocumentItem[] };
  },

  getDocumentViewUrl(id: string) {
    return `${gatewayBaseUrl}/documents/${id}/view`;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async uploadPdf(file: File, uploadedBy: string): Promise<{ document: DocumentItem }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data as { document: DocumentItem };
  },
};
