import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller.js';

export const conversationRouter = Router();

conversationRouter.get('/', conversationController.listConversations);
conversationRouter.post('/', conversationController.createConversation);
conversationRouter.get('/:id', conversationController.getConversation);
conversationRouter.patch('/:id', conversationController.updateConversation);
conversationRouter.delete('/:id', conversationController.deleteConversation);
conversationRouter.get('/:id/messages', conversationController.listMessages);
conversationRouter.post('/:id/messages', conversationController.createMessage);