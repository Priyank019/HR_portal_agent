import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller.js';

export const conversationRouter = Router();

conversationRouter.get('/', conversationController.listConversations);
conversationRouter.post('/', conversationController.createConversation);
conversationRouter.get('/:conversationId', conversationController.getConversation);
conversationRouter.get('/:conversationId/messages', conversationController.listMessages);
conversationRouter.post('/:conversationId/messages', conversationController.createMessage);