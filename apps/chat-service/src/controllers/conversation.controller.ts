import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { badRequest, unauthorized } from '../errors/http-error.js';
import { conversationService } from '../services/conversation.service.js';
import { messageService } from '../services/message.service.js';

const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
});

const updateConversationSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

const createMessageSchema = z.object({
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

const getAuthenticatedUserId = (req: Request) => {
  if (!req.user) {
    throw unauthorized('Authentication required');
  }

  return req.user.id;
};

export const conversationController = {
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createConversationSchema.parse(req.body);
      const conversation = await conversationService.createConversation({
        title: payload.title,
        userId: getAuthenticatedUserId(req),
      });
      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await conversationService.listConversations(getAuthenticatedUserId(req));
      res.status(200).json({ items: conversations });
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.id);

      const conversation = await conversationService.getConversation(conversationId, getAuthenticatedUserId(req));
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.id);

      const messages = await messageService.listMessages(conversationId, getAuthenticatedUserId(req));
      res.status(200).json({ items: messages });
    } catch (error) {
      next(error);
    }
  },

  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.id);

      const payload = createMessageSchema.parse(req.body);
      const message = await messageService.createMessage({
        conversationId,
        userId: getAuthenticatedUserId(req),
        role: payload.role,
        content: payload.content,
      });

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  },

  async updateConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.id);
      const payload = updateConversationSchema.parse(req.body);
      const conversation = await conversationService.updateConversation({
        conversationId,
        userId: getAuthenticatedUserId(req),
        title: payload.title,
      });

      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = getConversationId(req.params.id);
      await conversationService.deleteConversation(conversationId, getAuthenticatedUserId(req));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};