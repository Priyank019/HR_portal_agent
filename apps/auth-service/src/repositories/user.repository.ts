import { prisma } from '../lib/prisma.js';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: 'EMPLOYEE' | 'HR' | 'ADMIN';
  }) {
    return prisma.user.create({
      data,
    });
  },
};