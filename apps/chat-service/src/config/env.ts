import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, '../../.env');

dotenv.config({ path: envFilePath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4006),
  CORS_ORIGIN: z.string().default('http://172.26.144.1:3000'),
  DATABASE_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);