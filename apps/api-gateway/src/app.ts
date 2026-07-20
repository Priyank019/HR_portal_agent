import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authGatewayRouter } from './routes/auth.routes.js';
import { chatGatewayRouter } from './routes/chat.routes.js';
import { documentGatewayRouter } from './routes/document.routes.js';
import { ragGatewayRouter } from './routes/rag.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  console.log("Using Gateway CORS:", env.CORS_ORIGIN);
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use((req, _res, next) => {
  console.log("========== GATEWAY REQUEST ==========");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Origin:", req.headers.origin);
  console.log("=====================================");
  next();
});

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'api-gateway' });
  });

  app.use('/auth', authGatewayRouter);
  app.use('/chat', chatGatewayRouter);
  app.use('/documents', documentGatewayRouter);
  app.use('/api', ragGatewayRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};