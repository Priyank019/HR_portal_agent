import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareText, Plus, SendHorizontal } from 'lucide-react';
import { type ChatResponse, chatApi } from '../lib/chat-api';
import { useChatStore } from '../stores/chat-store';

const formatTimestamp = (value: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(value);

export function ChatPanel() {
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const messages = useChatStore((state) => state.messages);
  const createConversation = useChatStore((state) => state.createConversation);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const queueQuestion = useChatStore((state) => state.queueQuestion);
  const applyAssistantResponse = useChatStore((state) => state.applyAssistantResponse);
  const finalizeAssistantMessage = useChatStore((state) => state.finalizeAssistantMessage);
  const failAssistantMessage = useChatStore((state) => state.failAssistantMessage);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0],
    [activeConversationId, conversations],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const startNewChat = () => {
    createConversation();
    setDraft('');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = draft.trim();

    if (!trimmed || isLoading || !activeConversation) {
      return;
    }

    const { assistantMessageId, conversationId } = queueQuestion(trimmed);

    setDraft('');
    setIsLoading(true);

    try {
      await chatApi.ask(trimmed, (partialResponse: ChatResponse) => {
        applyAssistantResponse(conversationId, assistantMessageId, partialResponse);
      });

      finalizeAssistantMessage(conversationId, assistantMessageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch chat response';
      failAssistantMessage(conversationId, assistantMessageId, message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-15rem)] gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex max-h-[75vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:max-h-[calc(100vh-15rem)]">
        <div className="border-b border-slate-200 p-4">
          <button
            type="button"
            onClick={startNewChat}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversation?.id;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversation(conversation.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{conversation.title}</p>
                      <p className={`mt-1 truncate text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {conversation.preview}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {formatTimestamp(conversation.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="flex min-h-[75vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:min-h-[calc(100vh-15rem)]">
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">HR Chat</h3>
          <p className="mt-1 text-sm text-slate-600">Ask questions, review prior chats, and keep the current authenticated API flow unchanged.</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 px-4 py-6 sm:px-6">
          {activeConversation && messages.length > 0 ? (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
              {messages.map((message) => {
                const isUser = message.role === 'user';

                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm sm:max-w-[75%] ${
                        isUser
                          ? 'bg-slate-900 text-white'
                          : message.isError
                            ? 'border border-rose-200 bg-rose-50 text-rose-700'
                            : 'border border-slate-200 bg-white text-slate-900'
                      }`}
                    >
                      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${isUser ? 'text-slate-300' : 'text-slate-400'}`}>
                        {isUser ? 'You' : 'Assistant'}
                      </p>

                      {message.text ? <p className="whitespace-pre-wrap leading-6">{message.text}</p> : null}

                      {message.isStreaming && message.text.length === 0 ? (
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="inline-flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                          </span>
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : null}

                      {!isUser && !message.isError && (message.sources?.length || message.retrievedChunkCount) ? (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <p>
                              <span className="font-semibold text-slate-900">Retrieved chunks:</span>{' '}
                              {message.retrievedChunkCount ?? 0}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-900">Similarity scores:</span>{' '}
                              {message.similarityScores && message.similarityScores.length > 0
                                ? message.similarityScores.map((score) => score.toFixed(4)).join(', ')
                                : 'None'}
                            </p>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="font-semibold uppercase tracking-[0.18em] text-slate-500">Sources</p>
                            {message.sources && message.sources.length > 0 ? (
                              message.sources.map((source) => (
                                <div
                                  key={`${message.id}-${source.documentId}-${source.chunkIndex}`}
                                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                                >
                                  <p className="font-medium text-slate-900">{source.fileName}</p>
                                  <p className="text-[11px] text-slate-500">
                                    Document {source.documentId} · Chunk {source.chunkIndex}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p>No source documents were retrieved.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full min-h-[22rem] items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <MessageSquareText size={24} />
                </div>
                <h4 className="mt-5 text-xl font-semibold text-slate-900">Start a new conversation</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ask about policies, documents, or HR workflows. This UI keeps a local conversation history while still sending each message through the existing backend endpoint.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <form className="mx-auto flex w-full max-w-4xl items-end gap-3" onSubmit={onSubmit}>
            <label className="flex-1">
              <span className="sr-only">Message</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message the assistant..."
                className="max-h-40 min-h-[3.5rem] w-full resize-y rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white"
                rows={1}
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || draft.trim().length === 0}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
            >
              <SendHorizontal size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
