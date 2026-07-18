import { Router } from 'express';

export const documentRouter = Router();

// Upload implementation is intentionally deferred.
documentRouter.get('/', (_req, res) => {
  res.status(200).json({ items: [] });
});
