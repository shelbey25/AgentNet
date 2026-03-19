// AgentNet Platform Chat Engine — Generic AI assistant for the AgentNet platform
// GPT function-calling access to the platform API (search, browse, actions, memory)

import OpenAI from "openai";
import { prisma } from "@/lib/db";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

// ─── Tool definition ────────────────────────────────────
const AGENTNET_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "agentnet_api",
      description: `Execute an API call on the AgentNet platform. You can search entities (people, businesses, sites, opportunities), browse details with tiered depth, and take actions.

Entity types: person, business, site, opportunity

ENDPOINTS:

SEARCH:
- GET /api/v1/search?q=<query>&type=<person|business|site|opportunity>&capability=<ordering|booking|quotes|availability>&category=<category>&action=<book|order|message|quote|request_service|availability>

BROWSE (tiered depth — L0, L1, L2):
- GET /api/v1/browse/<entity_id> → L0: overview + section abstracts
- GET /api/v1/browse/<entity_id>/<section>?depth=L1 → L1: ALL subsection data (PREFERRED)
- GET /api/v1/browse/<entity_id>/<section>/<sub> → L2: single subsection detail

PROFILE:
- GET /api/v1/profile/<id> → full profile + capabilities

ACTIONS:
- GET /api/v1/availability?business_id=<id>&date=<YYYY-MM-DD>&service=<name>
- POST /api/v1/book body: {"business_id":"<id>","service":"<name>","time":"<ISO>","custom_fields":{}}
- POST /api/v1/order body: {"business_id":"<id>","items":[{"id":"<id>","qty":<n>}],"pickup_time":"<HH:MM>"}
- POST /api/v1/message body: {"recipient_id":"<id>","message":"<text>","subject":"<sub>"}
- POST /api/v1/request_service body: {"provider_id":"<id>","service":"<name>","time_preference":"<pref>"}

MEMORY:
- GET /api/v1/memory?userId=<user_id> → get stored memories
- POST /api/v1/memory body: {"userId":"<user_id>","key":"<key>","value":"<value>"} → save memory`,
      parameters: {
        type: "object",
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PATCH", "DELETE"] },
          path: { type: "string", description: "API path starting with /api/v1/" },
          body: { type: "object", description: "Request body for POST/PATCH" },
        },
        required: ["method", "path"],
      },
    },
  },
];

// ─── System prompt ────────────────────────────────────
function buildSystemPrompt(memories: { key: string; value: string }[]): string {
  let memoryContext = "";
  if (memories.length > 0) {
    memoryContext = `\n\nUser context (from memory):\n${memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")}`;
  }

  return `You are the AgentNet Assistant — a helpful AI that connects users with entities on the AgentNet platform.

AgentNet is a universal entity platform. It hosts profiles for people, businesses, sites, and opportunities. You can search for entities, browse their details (using tiered L0/L1/L2 depth), and take actions like booking, ordering, messaging, or requesting services.

BROWSING STRATEGY:
1. Search first to find matching entities
2. Browse L0 for an overview
3. Browse L1 for full section details (preferred — gets everything at once)
4. Browse L2 only for a specific subsection if needed

Always be helpful, concise, and action-oriented. When showing results, format them clearly with names, descriptions, and available actions.${memoryContext}`;
}

// ─── Execute tool call ──────────────────────────────────
async function executeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  if (name !== "agentnet_api") return JSON.stringify({ error: "Unknown tool" });

  const method = (args.method as string) || "GET";
  const path = args.path as string;
  const body = args.body as Record<string, unknown> | undefined;

  try {
    const url = `${getBaseUrl()}${path}`;
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body && (method === "POST" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();
    return JSON.stringify(data).slice(0, 8000);
  } catch (error) {
    return JSON.stringify({
      error: error instanceof Error ? error.message : "API call failed",
    });
  }
}

// ─── Chat (non-streaming) ────────────────────────────────
export async function chat(
  sessionId: string,
  userMessage: string,
  userId: string
): Promise<{ reply: string; toolCalls?: unknown[] }> {
  const openai = getOpenAI();

  // Load memories
  const memories = await prisma.userMemory.findMany({ where: { userId } });
  const memPairs = memories.map((m) => ({ key: m.key, value: m.value }));

  // Load recent messages
  const recent = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = recent
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  // Save user message
  await prisma.chatMessage.create({
    data: { sessionId, role: "user", content: userMessage },
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(memPairs) },
    ...history,
    { role: "user", content: userMessage },
  ];

  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: AGENTNET_TOOLS,
    tool_choice: "auto",
  });

  const allToolCalls: unknown[] = [];

  // Tool call loop (max 5 iterations)
  let iterations = 0;
  while (response.choices[0].message.tool_calls && iterations < 5) {
    const assistantMsg = response.choices[0].message;
    messages.push(assistantMsg);

    for (const tc of assistantMsg.tool_calls!) {
      const fn = tc as { function: { name: string; arguments: string }; id: string };
      const args = JSON.parse(fn.function.arguments);
      const result = await executeToolCall(fn.function.name, args);
      allToolCalls.push({ name: fn.function.name, args, result: JSON.parse(result) });

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: AGENTNET_TOOLS,
      tool_choice: "auto",
    });
    iterations++;
  }

  const reply = response.choices[0].message.content || "I wasn't able to generate a response.";

  // Save assistant message
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: reply,
      toolCalls: allToolCalls.length ? JSON.stringify(allToolCalls) : undefined,
    },
  });

  return { reply, toolCalls: allToolCalls.length ? allToolCalls : undefined };
}

// ─── Stream chat ─────────────────────────────────────────
export async function streamChat(
  sessionId: string,
  userMessage: string,
  userId: string
): Promise<ReadableStream> {
  const openai = getOpenAI();

  const memories = await prisma.userMemory.findMany({ where: { userId } });
  const memPairs = memories.map((m) => ({ key: m.key, value: m.value }));

  const recent = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = recent
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  await prisma.chatMessage.create({
    data: { sessionId, role: "user", content: userMessage },
  });

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: buildSystemPrompt(memPairs) },
          ...history,
          { role: "user", content: userMessage },
        ];

        // Non-streaming tool call phase first
        let toolResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
          tools: AGENTNET_TOOLS,
          tool_choice: "auto",
        });

        let iterations = 0;
        while (toolResponse.choices[0].message.tool_calls && iterations < 5) {
          const assistantMsg = toolResponse.choices[0].message;
          messages.push(assistantMsg);

          for (const tc of assistantMsg.tool_calls!) {
            const fn = tc as { function: { name: string; arguments: string }; id: string };
            const args = JSON.parse(fn.function.arguments);
            send("tool_call", { name: fn.function.name, args });

            const result = await executeToolCall(fn.function.name, args);
            send("tool_result", { name: fn.function.name, result: JSON.parse(result) });

            messages.push({
              role: "tool",
              tool_call_id: fn.id,
              content: result,
            });
          }

          toolResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            tools: AGENTNET_TOOLS,
            tool_choice: "auto",
          });
          iterations++;
        }

        // If no more tool calls, stream final response
        if (!toolResponse.choices[0].message.tool_calls) {
          // Use the already-obtained response content
          const content = toolResponse.choices[0].message.content || "";
          // Stream it chunk by chunk for UX
          const words = content.split(" ");
          let fullReply = "";
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(" ") + " ";
            fullReply += chunk;
            send("token", { content: chunk });
            await new Promise((r) => setTimeout(r, 20));
          }

          send("done", { fullReply: fullReply.trim() });

          await prisma.chatMessage.create({
            data: { sessionId, role: "assistant", content: fullReply.trim() },
          });
        }
      } catch (error) {
        send("error", {
          message: error instanceof Error ? error.message : "Stream failed",
        });
      } finally {
        controller.close();
      }
    },
  });
}
