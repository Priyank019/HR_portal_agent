import "dotenv/config";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";
const currentDir = dirname(fileURLToPath(import.meta.url));
const envFilePath = resolve(currentDir, "../../.env");

dotenv.config({ path: envFilePath });

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    AUTH_SERVICE_URL: z.string().url().default("http://localhost:4001"),
    RAG_SERVICE_URL: z.string().url().default("http://localhost:4002"),
    DOCUMENT_SERVICE_URL: z.string().url().default("http://localhost:4003"),
    CORS_ORIGIN: z.string().default("http://172.26.144.1:3000"),
});

export const env = envSchema.parse(process.env);
// console.log("Gateway CORS_ORIGIN =", env.CORS_ORIGIN);
console.log("========== API GATEWAY ==========");
console.log("Gateway CORS_ORIGIN:", env.CORS_ORIGIN);
console.log("Gateway AUTH_SERVICE_URL:", env.AUTH_SERVICE_URL);
console.log("Gateway RAG_SERVICE_URL:", env.RAG_SERVICE_URL);
console.log("Gateway DOCUMENT_SERVICE_URL:", env.DOCUMENT_SERVICE_URL);
console.log("=================================");