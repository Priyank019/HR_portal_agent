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
    role: 'Employee' | 'HR' | 'Admin';
  }) {
    return prisma.user.create({
      data,
    });
  },
};