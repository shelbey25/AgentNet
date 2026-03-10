// POST /api/chat/stream — SSE streaming chat endpoint
// Sends events as each tool call happens so the UI can show live progress

import { NextRequest } from "next/server";
import { runChatStream, ChatEvent } from "@/lib/chat-engine";
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

  // Get user context
  const session = await auth();
  const userId = session?.user?.id;
  let memories: Array<{ key: string; value: string }> = [];

  if (userId) {
    try {
      const userMemories = await prisma.userMemory.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 50,
      });
      memories = userMemories.map((m: { key: string; value: string }) => ({
        key: m.key,
        value: m.value,
      }));
    } catch {
      // Non-critical
    }
  }

  // Create a readable stream that sends SSE events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const result = await runChatStream(
          messages,
          (event: ChatEvent) => {
            switch (event.type) {
              case "thinking":
                send("thinking", {});
                break;
              case "tool_start":
                send("tool_start", { method: event.method, endpoint: event.endpoint });
                break;
              case "tool_done":
                send("tool_done", { method: event.method, endpoint: event.endpoint, status: event.status });
                break;
              case "message":
                send("message", { content: event.content, tool_calls: event.toolCalls });
                break;
            }
          },
          { userId, memories }
        );

        // Persist to chat session
        if (session_id) {
          try {
            const lastUserMsg = messages[messages.length - 1];
            if (lastUserMsg?.role === "user") {
              await prisma.chatMessage.create({
                data: { sessionId: session_id, role: "user", content: lastUserMsg.content },
              });
            }
            await prisma.chatMessage.create({
              data: {
                sessionId: session_id,
                role: "assistant",
                content: result.message,
                toolCalls: result.toolCalls
                  ? JSON.parse(JSON.stringify(result.toolCalls))
                  : undefined,
              },
            });
          } catch {
            // Non-critical
          }
        }
      } catch (error) {
        send("error", {
          error: error instanceof Error ? error.message : "Internal server error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
