import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authGatewayRouter } from './routes/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'api-gateway' });
  });

  app.use('/auth', authGatewayRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};