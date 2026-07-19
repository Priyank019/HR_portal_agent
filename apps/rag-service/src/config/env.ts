import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, '../../.env');

dotenv.config({ path: envFilePath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4002),
  CORS_ORIGIN: z.string().default('http://172.26.144.1:3000'),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
});

export const env = envSchema.parse(process.env);


console.log("ENV FILE:", envFilePath);
// console.log("DOTENV RESULT:", result);
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");
