import { FormEvent, useMemo, useState } from 'react';
import { type ChatResponse, chatApi } from '../lib/chat-api';

type Message = {
  role: 'question' | 'response';
  text: string;
};

export function ChatPanel() {
  const [question, setQuestion] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messages = useMemo<Message[]>(() => {
    const next: Message[] = [];

    if (currentQuestion) {
      next.push({ role: 'question', text: currentQuestion });
    }

    if (currentAnswer) {
      next.push({ role: 'response', text: currentAnswer });
    }

    return next;
  }, [currentQuestion, currentAnswer]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setErrorMessage(null);
    setCurrentQuestion(trimmed);
    setCurrentAnswer(null);
    setCurrentResponse(null);
    setIsLoading(true);

    try {
      await chatApi.ask(trimmed, (partialResponse) => {
        setCurrentAnswer(partialResponse.answer);
        setCurrentResponse(partialResponse);
      });

      setQuestion('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch chat response';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">HR Chat</h3>
        <p className="mt-1 text-sm text-slate-600">Single-turn chat: one question and one response.</p>
      </div>

      <div className="mb-4 min-h-28 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Ask a question to get a response.</p>
        ) : (
          messages.map((message) => (
            <div
              key={`${message.role}-${message.text}`}
              className={`rounded-xl px-3 py-2 text-sm ${
                message.role === 'question' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-900'
              }`}
            >
              <p className="mb-1 text-xs uppercase tracking-wide opacity-70">
                {message.role === 'question' ? 'Question' : 'Response'}
              </p>
              <p>{message.text}</p>
            </div>
          ))
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            <span>Loading response...</span>
          </div>
        ) : null}

        {currentResponse ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-4">
              <p>
                <span className="font-semibold text-slate-900">Retrieved chunks:</span> {currentResponse.retrievedChunkCount}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Similarity scores:</span>{' '}
                {currentResponse.similarityScores.length > 0
                  ? currentResponse.similarityScores.map((score) => score.toFixed(4)).join(', ')
                  : 'None'}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sources</p>
              {currentResponse.sources.length > 0 ? (
                currentResponse.sources.map((source) => (
                  <div
                    key={`${source.documentId}-${source.chunkIndex}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <p className="font-medium text-slate-900">{source.fileName}</p>
                    <p className="text-xs text-slate-500">
                      Document {source.documentId} · Chunk {source.chunkIndex}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No source documents were retrieved.</p>
              )}
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</div>
        ) : null}
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Type your question..."
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || question.trim().length === 0}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
