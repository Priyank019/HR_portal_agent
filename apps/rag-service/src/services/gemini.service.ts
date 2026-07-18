import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const generateAnswer = async (question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: question,
  });

  return response.text?.trim() || 'No response generated.';
};
