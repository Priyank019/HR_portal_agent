import type { MessageRole } from '../../generated/prisma/index.js';
import { notFound } from '../errors/http-error.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { messageRepository } from '../repositories/message.repository.js';

const toMessageDto = (message: Awaited<ReturnType<typeof messageRepository.create>>) => ({
  id: message.id,
  conversationId: message.conversationId,
  role: message.role,
  content: message.content,
  createdAt: message.createdAt.toISOString(),
});

export const messageService = {
  async listMessages(conversationId: string, userId: string) {
    const conversation = await conversationRepository.findByIdAndUserId(conversationId, userId);

    if (!conversation) {
      throw notFound('Conversation not found');
    }

    const messages = await messageRepository.listByConversationId(conversationId);
    return messages.map(toMessageDto);
  },

  async createMessage(input: {
    conversationId: string;
    userId: string;
    role: MessageRole;
    content: string;
  }) {
    const conversation = await conversationRepository.findByIdAndUserId(input.conversationId, input.userId);

    if (!conversation) {
      throw notFound('Conversation not found');
    }

    const trimmedContent = input.content.trim();
    const createdMessage = await messageRepository.create({
      conversationId: input.conversationId,
      role: input.role,
      content: trimmedContent,
    });

    if (input.role === 'USER' && conversation.messages.length === 0 && conversation.title === 'New chat') {
      await conversationRepository.updateTitle(input.conversationId, trimmedContent.slice(0, 48) || 'New chat');
    }

    await conversationRepository.touch(input.conversationId);

    return toMessageDto(createdMessage);
  },
};