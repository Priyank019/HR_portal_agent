import { Router } from 'express';
import { badRequest } from '../errors/http-error.js';
import { generateAnswerStream } from '../services/gemini.service.js';

export const ragRouter = Router();

ragRouter.post('/chat', async (req, res, next) => {
  try {
    const question =
      typeof req.body?.question === 'string'
        ? req.body.question.trim()
        : '';

    if (!question) {
      throw badRequest('Question is required');
    }

    const stream = await generateAnswerStream(question);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      const text = chunk.text;

      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (error) {
    next(error);
  }
});
