import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, "../../.env");

const result = dotenv.config({ path: envFilePath });

console.log("ENV FILE:", envFilePath);
console.log("DOTENV:", result);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4001),

  DATABASE_URL: z.string(),

  JWT_ACCESS_SECRET: z.string(),

  JWT_REFRESH_SECRET: z.string(),

  JWT_ACCESS_TTL: z.string().default("15m"),

  JWT_REFRESH_TTL: z.string().default("7d"),

  CORS_ORIGIN: z.string().default("http://172.26.144.1:3000"),
});

export const env = envSchema.parse(process.env);

console.log("========== AUTH SERVICE ==========");
console.log("PORT:", env.PORT);
console.log("DATABASE_URL:", env.DATABASE_URL);
console.log("JWT_ACCESS_SECRET:", env.JWT_ACCESS_SECRET);
console.log("JWT_REFRESH_SECRET:", env.JWT_REFRESH_SECRET);
console.log("CORS_ORIGIN:", env.CORS_ORIGIN);
console.log("=================================");