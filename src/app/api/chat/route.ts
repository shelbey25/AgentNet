// POST /api/chat — GPT-powered chat endpoint
// Receives user messages, runs GPT with MCP tool access to platform API
// Pre-fetches user memories so GPT has full context from the start

import { NextRequest, NextResponse } from "next/server";
import { runChat, selectRelevantMemories } from "@/lib/chat-engine";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, session_id } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Get user context — fetch all memories, then filter by relevance to current message
    const session = await auth();
    const userId = session?.user?.id;
    let memories: Array<{ key: string; value: string }> = [];
    let totalMemoryCount = 0;

    if (userId) {
      try {
        const userMemories = await prisma.userMemory.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
        });
        const allMemories = userMemories.map((m: { key: string; value: string }) => ({ key: m.key, value: m.value }));

        // Get the latest user message for keyword matching
        const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
        const userMessage = lastUserMsg?.content || "";

        const { relevant, totalCount } = selectRelevantMemories(allMemories, userMessage);
        memories = relevant;
        totalMemoryCount = totalCount;
      } catch {
        // Non-critical — proceed without memories
      }
    }

    // Run GPT with tool calling + user context
    const result = await runChat(messages, { userId, memories, totalMemoryCount });

    // Optionally persist to chat session
    let sessionId = session_id;
    if (sessionId) {
      try {
        // Save user's last message
        const lastUserMsg = messages[messages.length - 1];
        if (lastUserMsg?.role === "user") {
          await prisma.chatMessage.create({
            data: {
              sessionId,
              role: "user",
              content: lastUserMsg.content,
            },
          });
        }

        // Save assistant response
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: "assistant",
            content: result.message,
            toolCalls: result.toolCalls
              ? JSON.parse(JSON.stringify(result.toolCalls))
              : undefined,
          },
        });
      } catch {
        // Non-critical — don't fail the response
      }
    }

    return NextResponse.json({
      message: result.message,
      tool_calls: result.toolCalls?.map((tc: { endpoint: string; method: string }) => ({
        endpoint: tc.endpoint,
        method: tc.method,
      })),
      session_id: sessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
