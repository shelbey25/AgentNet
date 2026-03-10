"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface MessageItem {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  isDraft: boolean;
  createdAt: string;
  sender?: { id: string; name: string };
}

function MessagesContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const composeToUserId = searchParams.get("compose");

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Compose state
  const [showCompose, setShowCompose] = useState(!!composeToUserId);
  const [toUserId, setToUserId] = useState(composeToUserId || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [composeMsg, setComposeMsg] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/auth/login");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/messages")
        .then((res) => res.json())
        .then(setMessages)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const sendMessage = async () => {
    if (!toUserId || !subject || !body) return;
    setSending(true);
    setComposeMsg("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: toUserId, subject, body }),
    });

    const data = await res.json();
    setSending(false);

    if (res.ok) {
      setComposeMsg("Message sent!");
      setSubject("");
      setBody("");
      setToUserId("");
      setShowCompose(false);
    } else {
      setComposeMsg(data.error || "Failed to send message");
    }
  };

  const viewMessage = async (msg: MessageItem) => {
    setSelected(msg);
    if (!msg.isRead) {
      await fetch(`/api/messages/${msg.id}`);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
    }
  };

  if (sessionStatus === "loading" || loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="flex gap-3">
          <Link href="/dashboard" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            Dashboard
          </Link>
          <button
            onClick={() => { setShowCompose(!showCompose); setSelected(null); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            {showCompose ? "Cancel" : "Compose"}
          </button>
        </div>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">New Message</h2>
          {composeMsg && (
            <div className={`text-sm p-3 rounded-lg mb-4 ${composeMsg.includes("sent") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {composeMsg}
            </div>
          )}
          <div className="space-y-3">
            <input type="text" value={toUserId} onChange={(e) => setToUserId(e.target.value)} placeholder="Recipient User ID"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body..." rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={sendMessage} disabled={sending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Message detail */}
      {selected && !showCompose && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <button onClick={() => setSelected(null)} className="text-indigo-600 text-sm hover:underline mb-3">
            ← Back to inbox
          </button>
          <h2 className="font-semibold text-lg">{selected.subject}</h2>
          <p className="text-gray-400 text-xs mt-1">
            From: {selected.sender?.name || selected.senderId} · {new Date(selected.createdAt).toLocaleString()}
          </p>
          {selected.isDraft && (
            <span className="inline-block mt-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">AI Draft — Review before sending</span>
          )}
          <div className="mt-4 text-gray-700 whitespace-pre-wrap">{selected.body}</div>
        </div>
      )}

      {/* Inbox */}
      {!selected && !showCompose && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No messages yet</div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => viewMessage(msg)}
                className={`w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !msg.isRead ? "bg-indigo-50/50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {!msg.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full" />}
                    <div>
                      <p className={`text-sm ${!msg.isRead ? "font-semibold" : "font-medium"}`}>{msg.subject}</p>
                      <p className="text-xs text-gray-400">
                        From: {msg.sender?.name || msg.senderId}
                        {msg.isDraft && " · 🤖 AI Draft"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
