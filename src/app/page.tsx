"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{ endpoint: string; method: string }>;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Create session on first message
      let sid = sessionId;
      if (!sid) {
        const sessionRes = await fetch("/api/chat/session", { method: "POST" });
        const sessionData = await sessionRes.json();
        sid = sessionData.session_id;
        setSessionId(sid);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          session_id: sid,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `Error: ${data.error}`,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.message,
            toolCalls: data.tool_calls,
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "Find my CS advisor",
    "What's for lunch at Lakeside?",
    "I need a calculus tutor",
    "Research opportunities in AI",
    "When is Gorgas Library open?",
    "Scholarships for freshmen",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🐘</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              BamaAgent
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Your AI-powered campus assistant for The University of Alabama.
              Find professors, dining, tutors, research opportunities, and local businesses.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="text-left text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-gray-600 hover:text-indigo-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-2">
                    <div className="prose prose-sm prose-gray max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-1 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-1.5 [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:my-0.5 [&>li]:leading-relaxed [&_strong]:font-semibold [&>hr]:my-2 [&>blockquote]:border-l-2 [&>blockquote]:border-indigo-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>pre]:bg-gray-50 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:text-xs [&>pre]:overflow-x-auto [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>a]:text-indigo-600 [&>a]:underline [&>a]:hover:text-indigo-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span>⚡</span>
                          {msg.toolCalls.length} API call
                          {msg.toolCalls.length > 1 ? "s" : ""} made
                          <details className="inline">
                            <summary className="cursor-pointer ml-1 text-indigo-400 hover:text-indigo-600">
                              details
                            </summary>
                            <div className="mt-1 space-y-1">
                              {msg.toolCalls.map((tc, j) => (
                                <div
                                  key={j}
                                  className="font-mono text-xs bg-gray-50 px-2 py-1 rounded"
                                >
                                  {tc.method} {tc.endpoint}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                </div>
                Searching campus...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about campus, dining, professors, tutoring, opportunities..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm max-h-32"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          BamaAgent — AI-powered campus assistant for The University of Alabama
        </p>
      </div>
    </div>
  );
}
