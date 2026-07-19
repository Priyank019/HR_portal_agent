import { prisma } from '../lib/prisma.js';

export const documentRepository = {
  findMany() {
    return prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  },

  deleteById(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  },

  create(data: {
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
    uploadedBy: string;
  }) {
    return prisma.document.create({
      data,
    });
  },
};
