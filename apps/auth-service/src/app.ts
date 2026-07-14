import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });

  app.use('/auth', authRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};