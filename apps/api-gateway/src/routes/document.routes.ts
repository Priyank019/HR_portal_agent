import { Router } from 'express';
import { env } from '../config/env.js';
import { forwardRequest } from '../utils/forward-request.js';

export const documentGatewayRouter = Router();

documentGatewayRouter.all('/*', async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, env.DOCUMENT_SERVICE_URL).toString();
    await forwardRequest(req, res, targetUrl);
  } catch (error) {
    next(error);
  }
});
