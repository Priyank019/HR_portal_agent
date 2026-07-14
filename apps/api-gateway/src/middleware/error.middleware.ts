import type { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(502).json({ message: 'Gateway error' });
};