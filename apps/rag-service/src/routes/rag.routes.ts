import { Router } from 'express';
import { badRequest } from '../errors/http-error.js';
import { chatHistoryService } from '../services/chat-history.service.js';
import { ragService } from '../services/rag.service.js';
import { searchService } from '../services/search.service.js';

export const ragRouter = Router();

ragRouter.post('/search', async (req, res, next) => {
  try {
    const question =
      typeof req.body?.question === 'string'
        ? req.body.question.trim()
        : '';
    const limit = typeof req.body?.limit === 'number' ? req.body.limit : undefined;

    if (!question) {
      throw badRequest('Question is required');
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
      throw badRequest('limit must be a positive integer');
    }

    const results = await searchService.semanticSearch(question, limit);
    res.status(200).json({
      question,
      limit: limit ?? undefined,
      results,
    });
  } catch (error) {
    next(error);
  }
});

ragRouter.post('/chat', async (req, res, next) => {
  try {
    const question =
      typeof req.body?.question === 'string'
        ? req.body.question.trim()
        : '';
    const conversationId =
      typeof req.body?.conversationId === 'string'
        ? req.body.conversationId.trim()
        : '';
    const limit = typeof req.body?.limit === 'number' ? req.body.limit : undefined;
    const authorizationHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization : undefined;

    if (!question) {
      throw badRequest('Question is required');
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
      throw badRequest('limit must be a positive integer');
    }

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let conversationHistory: import('../services/rag.service.js').ConversationHistoryMessage[] = [];

    if (conversationId) {
      await chatHistoryService.saveUserMessage(conversationId, question, authorizationHeader);
      const conversation = await chatHistoryService.getConversation(conversationId, authorizationHeader);
      conversationHistory = conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      }));
    }

    await ragService.streamAnswer(
      question,
      limit,
      (event) => {
        res.write(ragService.serializeEvent(event));
      },
      {
        conversationHistory,
        beforeComplete: async (response) => {
          if (!conversationId) {
            return;
          }

          await chatHistoryService.saveAssistantMessage(conversationId, response.answer, authorizationHeader);
        },
      },
    );

    res.end();
  } catch (error) {
    next(error);
  }
});
