// POST /api/chat/stream — SSE streaming chat endpoint

import { NextRequest } from "next/server";
import { streamChat } from "@/lib/chat-engine";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { messages, session_id } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await auth();
  const userId = session?.user?.id;

  let sessionId = session_id;
  if (!sessionId && userId) {
    const chatSession = await prisma.chatSession.create({
      data: { userId, title: "New Chat" },
    });
    sessionId = chatSession.id;
  }

  if (!sessionId || !userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
  const userMessage = lastUserMsg?.content || "";

  const stream = await streamChat(sessionId, userMessage, userId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
