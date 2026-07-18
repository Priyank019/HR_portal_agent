import { Router } from 'express';
import { badRequest } from '../errors/http-error.js';
import { generateAnswer } from '../services/gemini.service.js';

export const ragRouter = Router();

ragRouter.post('/chat', async (req, res, next) => {
	try {
		const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

		if (!question) {
			throw badRequest('Question is required');
		}

		const answer = await generateAnswer(question);
		res.status(200).json({ answer });
	} catch (error) {
		next(error);
	}
});
