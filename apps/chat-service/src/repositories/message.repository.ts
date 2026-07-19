import type { MessageRole } from '../../generated/prisma/index.js';
import { prisma } from '../lib/prisma.js';

export const messageRepository = {
  create(data: { conversationId: string; role: MessageRole; content: string }) {
    return prisma.message.create({
      data,
    });
  },

  listByConversationId(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  },
};