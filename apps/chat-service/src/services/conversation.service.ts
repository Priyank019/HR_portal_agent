import { notFound } from '../errors/http-error.js';
import { conversationRepository } from '../repositories/conversation.repository.js';

const toConversationDto = (conversation: Awaited<ReturnType<typeof conversationRepository.create>>) => ({
  id: conversation.id,
  title: conversation.title,
  userId: conversation.userId,
  createdAt: conversation.createdAt.toISOString(),
  updatedAt: conversation.updatedAt.toISOString(),
  messages: conversation.messages.map((message) => ({
    id: message.id,
    conversationId: message.conversationId,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  })),
});

export const conversationService = {
  async createConversation(input: { title?: string; userId: string }) {
    const title = input.title?.trim() || 'New chat';
    const conversation = await conversationRepository.create({
      title,
      userId: input.userId,
    });

    return toConversationDto(conversation);
  },

  async listConversations(userId: string) {
    const conversations = await conversationRepository.listByUserId(userId);
    return conversations.map(toConversationDto);
  },

  async getConversation(conversationId: string, userId: string) {
    const conversation = await conversationRepository.findByIdAndUserId(conversationId, userId);

    if (!conversation) {
      throw notFound('Conversation not found');
    }

    return toConversationDto(conversation);
  },

  async updateConversation(input: { conversationId: string; userId: string; title: string }) {
    const conversation = await conversationRepository.findByIdAndUserId(input.conversationId, input.userId);

    if (!conversation) {
      throw notFound('Conversation not found');
    }

    const updatedConversation = await conversationRepository.updateTitle(input.conversationId, input.title.trim());
    return toConversationDto(updatedConversation);
  },

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await conversationRepository.findByIdAndUserId(conversationId, userId);

    if (!conversation) {
      throw notFound('Conversation not found');
    }

    await conversationRepository.delete(conversationId);
  },
};