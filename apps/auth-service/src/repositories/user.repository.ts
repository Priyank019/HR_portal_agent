import { prisma } from '../lib/prisma.js';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findByEmployeeId(employeeId: string) {
    return prisma.user.findUnique({
      where: { employeeId },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  create(data: {
    employeeId?: string | null;
    name: string;
    email: string;
    passwordHash: string;
    role: 'EMPLOYEE' | 'HR' | 'ADMIN';
    department?: string | null;
    designation?: string | null;
    mustChangePassword?: boolean;
    isActive?: boolean;
    createdById?: string | null;
  }) {
    return prisma.user.create({
      data,
    });
  },
};