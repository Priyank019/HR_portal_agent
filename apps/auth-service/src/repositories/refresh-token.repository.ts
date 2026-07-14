import { prisma } from '../lib/prisma.js';

export const refreshTokenRepository = {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data,
    });
  },

  findActiveByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },

  revokeByHash(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};