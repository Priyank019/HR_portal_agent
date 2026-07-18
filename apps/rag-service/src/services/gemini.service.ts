import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export const generateAnswerStream = async (question: string) => {
  return await ai.models.generateContentStream({
    model: env.GEMINI_MODEL,
    contents: question,
  });
};