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
};
