import { Router } from 'express';
import { env } from '../config/env.js';
import { forwardRequest } from '../utils/forward-request.js';

export const ragGatewayRouter = Router();

ragGatewayRouter.all('/*', async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, env.RAG_SERVICE_URL).toString();
    await forwardRequest(req, res, targetUrl);
  } catch (error) {
    next(error);
  }
});
