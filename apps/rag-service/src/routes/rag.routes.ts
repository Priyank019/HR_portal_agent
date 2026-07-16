import { Router } from 'express';

export const ragRouter = Router();

ragRouter.post('/chat', (_req, res) => {
	res.status(200).json({ answer: 'Hello from RAG Service' });
});
