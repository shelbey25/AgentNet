// POST /api/chat — GPT-powered chat endpoint
// Receives user messages, runs GPT with MCP tool access to platform API

import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/chat-engine";
import { prisma } from "@/lib/db";

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

    // Run GPT with tool calling
    const result = await runChat(messages);

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
      tool_calls: result.toolCalls?.map((tc) => ({
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
