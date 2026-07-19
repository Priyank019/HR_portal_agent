import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { badRequest } from '../errors/http-error.js';
import { conversationService } from '../services/conversation.service.js';
import { messageService } from '../services/message.service.js';

const userIdQuerySchema = z.object({
  userId: z.string().trim().min(1),
});

const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  userId: z.string().trim().min(1),
});

const createMessageSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(['USER', 'ASSISTANT']),
  content: z.string().trim().min(1),
});

const getConversationId = (value: string | string[] | undefined) => {
  if (typeof value !== 'string') {
    throw badRequest('conversationId is required');
  }

  const conversationId = value.trim();

  if (!conversationId) {
    throw badRequest('conversationId is required');
  }

  return conversationId;
};

export const conversationController = {
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createConversationSchema.parse(req.body);
      const conversation = await conversationService.createConversation(payload);
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const query = userIdQuerySchema.parse(req.query);
      const conversations = await conversationService.listConversations(query.userId);
      res.status(200).json({ items: conversations });
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const query = userIdQuerySchema.parse(req.query);
      const conversationId = getConversationId(req.params.conversationId);

      const conversation = await conversationService.getConversation(conversationId, query.userId);
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const query = userIdQuerySchema.parse(req.query);
      const conversationId = getConversationId(req.params.conversationId);

      const messages = await messageService.listMessages(conversationId, query.userId);
      res.status(200).json({ items: messages });
    } catch (error) {
      next(error);
    }
  },

  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.conversationId);

      const payload = createMessageSchema.parse(req.body);
      const message = await messageService.createMessage({
        conversationId,
        userId: payload.userId,
        role: payload.role,
        content: payload.content,
      });

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },
};