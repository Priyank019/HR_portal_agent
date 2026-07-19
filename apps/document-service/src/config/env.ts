import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, '../../.env');

dotenv.config({ path: envFilePath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4003),
  CORS_ORIGIN: z.string().default('http://10.197.7.142:3000'),
  DATABASE_URL: z.string().min(1),
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().optional(),
  EMBEDDING_DIMENSION: z.coerce.number().int().positive(),
});

export const env = envSchema.parse(process.env);
