"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ToolCall {
  endpoint: string;
  method: string;
  status?: "pending" | "done" | "error";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [liveToolCalls, setLiveToolCalls] = useState<ToolCall[]>([]);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSent = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveToolCalls]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-send prompt from URL query param
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true;
      setInput(prompt);
      // Small delay to let state settle
      setTimeout(() => {
        sendMessageDirect(prompt);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const sendMessageDirect = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setLiveToolCalls([]);
    setAgentStatus("Thinking...");
    await doStream(newMessages);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setLiveToolCalls([]);
    setAgentStatus("Thinking...");
    await doStream(newMessages);
  };

  const doStream = async (newMessages: Message[]) => {
    try {
      let sid = sessionId;
      if (!sid) {
        const sessionRes = await fetch("/api/chat/session", { method: "POST" });
        const sessionData = await sessionRes.json();
        sid = sessionData.session_id;
        setSessionId(sid);
      }

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          session_id: sid,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessages([...newMessages, { role: "assistant", content: `Error: ${errData.error || "Request failed"}` }]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(currentEvent, data, newMessages);
            } catch { /* ignore parse errors */ }
            currentEvent = "";
          }
        }
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      setLiveToolCalls([]);
      setAgentStatus("");
    }
  };

  const handleSSEEvent = (event: string, data: Record<string, unknown>, baseMessages: Message[]) => {
    switch (event) {
      case "thinking":
        setAgentStatus("Thinking...");
        break;
      case "tool_start":
        setAgentStatus(`Calling ${data.method} ${data.endpoint}`);
        setLiveToolCalls((prev) => [...prev, { method: data.method as string, endpoint: data.endpoint as string, status: "pending" }]);
        break;
      case "tool_done":
        setLiveToolCalls((prev) =>
          prev.map((tc) =>
            tc.endpoint === data.endpoint && tc.method === data.method && tc.status === "pending"
              ? { ...tc, status: data.status === "ok" ? "done" : "error" }
              : tc
          )
        );
        setAgentStatus("Analyzing results...");
        break;
      case "message":
        setMessages([...baseMessages, { role: "assistant", content: data.content as string, toolCalls: data.tool_calls as ToolCall[] }]);
        setLiveToolCalls([]);
        setAgentStatus("");
        break;
      case "error":
        setMessages([...baseMessages, { role: "assistant", content: `Error: ${data.error}` }]);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "What scholarships can I apply for?",
    "Help me plan my Fall semester",
    "Which professors do ML research?",
    "Review my resume for internships",
    "What should I do this summer?",
    "Find research opportunities in CS",
  ];

  const methodColor = (method: string) =>
    method === "POST" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

  const statusIcon = (status?: string) => {
    switch (status) {
      case "pending": return "⏳";
      case "done": return "✅";
      case "error": return "❌";
      default: return "⚡";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">🐘</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">BamaAdvisor</h1>
            <p className="text-gray-500 mb-8 max-w-md">
              Your AI academic advisor. Ask about courses, research, scholarships,
              career paths, or anything else at UA.
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-left text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-[var(--crimson-light)] transition-colors text-gray-600 hover:text-[var(--crimson)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[var(--crimson)] text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="space-y-2">
                    <div className="prose prose-sm prose-gray max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-1 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-1.5 [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:my-0.5 [&>li]:leading-relaxed [&_strong]:font-semibold [&>hr]:my-2 [&>blockquote]:border-l-2 [&>blockquote]:border-[var(--crimson-light)] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>pre]:bg-gray-50 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:text-xs [&>pre]:overflow-x-auto [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&>pre_code]:bg-transparent [&>pre_code]:p-0 [&>a]:text-[var(--crimson)] [&>a]:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <details className="group">
                          <summary className="text-xs text-gray-400 flex items-center gap-1 cursor-pointer hover:text-gray-600">
                            <span>⚡</span>
                            {msg.toolCalls.length} API call{msg.toolCalls.length > 1 ? "s" : ""} made
                            <span className="ml-1 text-[var(--crimson-light)] group-open:hidden">▸ show</span>
                            <span className="ml-1 text-[var(--crimson-light)] hidden group-open:inline">▾ hide</span>
                          </summary>
                          <div className="mt-1.5 space-y-1">
                            {msg.toolCalls.map((tc, j) => (
                              <div key={j} className="flex items-center gap-2 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${methodColor(tc.method)}`}>{tc.method}</span>
                                <span className="text-gray-600 truncate">{tc.endpoint}</span>
                                <span className="ml-auto">{statusIcon("done")}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[85%]">
              {liveToolCalls.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {liveToolCalls.map((tc, i) => (
                    <div key={i} className={`flex items-center gap-2 font-mono text-xs px-2 py-1.5 rounded transition-all duration-300 ${
                      tc.status === "pending" ? "bg-red-50 border border-red-100" : tc.status === "error" ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-100"
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${methodColor(tc.method)}`}>{tc.method}</span>
                      <span className="text-gray-600 truncate">{tc.endpoint}</span>
                      <span className="ml-auto">
                        {tc.status === "pending" ? <span className="inline-block animate-spin text-[var(--crimson)]">⟳</span> : statusIcon(tc.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                </div>
                <span className="text-xs">{agentStatus || "Researching..."}</span>
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
            placeholder="Ask about courses, research, scholarships, career paths..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent text-sm max-h-32"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 btn-crimson rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          BamaAdvisor — AI Academic Advisor for The University of Alabama
        </p>
      </div>
    </div>
  );
}
