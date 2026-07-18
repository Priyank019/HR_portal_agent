import axios from 'axios';

type ChatRequest = {
  question: string;
};

type ChatResponse = {
  answer: string;
};

const gatewayBaseUrl =
  import.meta.env.VITE_API_GATEWAY_URL ?? "http://localhost:4000";

export const chatApi = {
  async ask(
    question: string,
    onChunk: (text: string) => void
  ): Promise<void> {
    const response = await fetch(`${gatewayBaseUrl}/api/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    if (!response.body) {
      throw new Error("Streaming not supported");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let answer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      answer += decoder.decode(value, { stream: true });

      onChunk(answer);
    }
  },
};