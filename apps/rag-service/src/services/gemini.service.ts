import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export const generateContent = async (prompt: string) => {
  return await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
  });
};

export const generateContentStream = async (prompt: string) => {
  return await ai.models.generateContentStream({
    model: env.GEMINI_MODEL,
    contents: prompt,
  });
};