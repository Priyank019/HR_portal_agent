import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Key loaded:", !!process.env.GEMINI_API_KEY);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: "Hello world",
    });

    console.log("Success!");
    console.dir(response, { depth: null });
  } catch (error) {
    console.error("Embedding failed:");
    console.dir(error, { depth: null });
  }
}

main();