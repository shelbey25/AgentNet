// POST /api/chat — GPT-powered chat with session management

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/chat-engine";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { messages, session_id } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    // Ensure we have a chat session
    let sessionId = session_id;
    if (!sessionId && userId) {
      const chatSession = await prisma.chatSession.create({
        data: { userId, title: "New Chat" },
      });
      sessionId = chatSession.id;
    }

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
    const userMessage = lastUserMsg?.content || "";

    const result = await chat(sessionId, userMessage, userId);

    return NextResponse.json({
      message: result.reply,
      tool_calls: result.toolCalls,
      session_id: sessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
