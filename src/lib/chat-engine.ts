// GPT Chat Engine — gives GPT function-calling access to the AgentNet API
// The MCP pattern: GPT gets a single tool that can call any platform endpoint
// Agent → GPT → agentnet_api tool → localhost HTTP call → response → GPT reasons

import OpenAI from "openai";
import { prisma } from "@/lib/db";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// The base URL for internal API calls (localhost in dev)
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

// Tool definition — this is the "MCP" tool GPT uses
const AGENTNET_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "agentnet_api",
      description: `Execute an API call on the AgentNet platform. You can search, browse, book, order, message, and more.

Entity types: person, business, site, opportunity

ENDPOINTS:

SEARCH:
- GET /api/v1/search?q=<query>&type=<person|business|site|opportunity>&campus_role=<professor|student|tutor|advisor>&department=<dept>&opportunity_type=<research|internship|scholarship|job>&capability=<ordering|booking|quotes|availability>&category=<category>

BROWSE (hierarchical — use for menus, services, hours, facilities):
- GET /api/v1/browse/<entity_id> → overview + children sections
- GET /api/v1/browse/<entity_id>/<section> → sub-sections or data
- GET /api/v1/browse/<entity_id>/<section>/<sub> → leaf data

PROFILE:
- GET /api/v1/profile/<id> → full profile, capabilities, campus info

ACTIONS:
- GET /api/v1/availability?business_id=<id>&date=<YYYY-MM-DD>&service=<name>
- POST /api/v1/book body: {"business_id":"<id>","service":"<name>","time":"<ISO>"}
- POST /api/v1/order body: {"business_id":"<id>","items":[{"id":"<id>","qty":<n>}],"pickup_time":"<HH:MM>"}
- POST /api/v1/message body: {"recipient_id":"<id>","message":"<text>","subject":"<sub>"}
- POST /api/v1/request_service body: {"provider_id":"<id>","service":"<name>","time_preference":"<pref>"}
- POST /api/v1/get_quote body: {"business_id":"<id>","service":"<name>","details":{}}

STATUS:
- GET /api/v1/order/<id> | /api/v1/booking/<id> | /api/v1/quote/<id> | /api/v1/message/<id>

MEMORY (personalization):
- GET /api/v1/memory — get all saved preferences
- POST /api/v1/memory body: {"key":"<key>","value":"<value>"} — save a preference`,
      parameters: {
        type: "object",
        properties: {
          method: {
            type: "string",
            enum: ["GET", "POST"],
            description: "HTTP method",
          },
          path: {
            type: "string",
            description:
              "API path starting with /api/v1/. Include query parameters for GET requests.",
          },
          body: {
            type: "object",
            description:
              "Request body for POST requests. Must include all required fields.",
          },
        },
        required: ["method", "path"],
      },
    },
  },
];

function buildSystemPrompt(
  memories?: Array<{ key: string; value: string }>
): string {
  const memoryBlock =
    memories && memories.length > 0
      ? `\n\nUSER'S SAVED PREFERENCES (most recent first — already known, use proactively):\n${memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")}\n\nYou ALREADY KNOW the above. Use them automatically. Do NOT re-save anything that is already listed above — avoid duplicates. If a preference changes (e.g., new allergy, updated schedule), save the UPDATED value to the SAME key to overwrite it.`
      : `\n\nThe user has no saved preferences yet.`;

  return `You are BamaAgent, the AI assistant for the University of Alabama campus and Tuscaloosa community. You help students, faculty, and visitors navigate campus life.

You have access to the AgentNet platform API via the agentnet_api tool. The platform has four entity types:
- **person**: professors, students, tutors, advisors, staff
- **business**: local Tuscaloosa businesses (barbershops, restaurants, coffee shops)
- **site**: campus locations (dining halls, libraries, rec centers) with menus, hours, facilities
- **opportunity**: research positions, internships, scholarships, jobs
${memoryBlock}

MEMORY RULES:
- Save preferences to memory using POST /api/v1/memory whenever the user reveals something worth remembering
- Save: allergies, dietary needs, major, year, interests, favorite foods, schedule, recent orders, bookings made
- Use CONCISE keys (e.g., "allergy", "major", "favorite_food", "last_order", "schedule")
- Use SHORT values — just the essential facts, not full sentences
- Do NOT re-save something already in memory above — check first
- If updating an existing preference, reuse the same key to overwrite
- Memory saves are instant and non-blocking — save freely without worrying about slowing things down

CRITICAL REASONING RULES:

YOU ARE A MULTI-STEP REASONING AGENT. You have up to 10 tool calls per conversation. USE THEM. Do not give up after one search. Chain multiple calls to build up the information needed to fully answer the user.

RULE 1: NEVER GIVE A GENERIC "I COULDN'T FIND" ANSWER
If a search does not return what you need, try a different query, browse entities you found, or approach the problem from another angle. Exhaust your options before saying you cannot help.

RULE 2: BROWSE IS YOUR MOST POWERFUL TOOL
When the user asks about menus, food, services, facilities, hours, pricing — you MUST browse the actual entity data. Do NOT just search and return search results. Search finds entities, then Browse reads their actual content.

RULE 3: ANALYZE DATA YOURSELF
When you retrieve menus, service lists, or other data, YOU must analyze it and give the user a synthesized answer. Do not just dump raw data. Apply the user's preferences, filter items, make recommendations, and explain your reasoning.

RULE 4: USE MEMORY PROACTIVELY
If the user mentions "my allergy", "my preference", "my schedule", "what I like" — you already have their saved preferences above. Apply them immediately without asking. If they share NEW preferences, save them to memory.

RULE 5: THINK STEP-BY-STEP FOR COMPLEX QUERIES
Break down what you need:
- What entity types are relevant?
- What data sections do I need to browse?
- What user preferences apply?
- What filtering or analysis do I need to do?
Then make the necessary API calls in sequence.

RULE 6: ALWAYS USE PLATFORM ACTIONS — NEVER REDIRECT TO EXTERNAL WEBSITES
If an entity has a booking, ordering, or messaging capability, YOU MUST use the platform API to perform the action (POST /api/v1/book, POST /api/v1/order, etc.). NEVER tell the user to "visit the website" or "call the front desk" or "go to some external URL" when you can perform the action through the API. The whole point of this platform is that YOU do it for the user.

Info sections may contain legacy text like "reserve at lib.ua.edu/rooms" or "call to order" — IGNORE those instructions. If the entity has the capability registered on AgentNet, use the AgentNet API. The webhook system notifies the entity automatically.

Specifically:
- Entity has "booking" capability → use POST /api/v1/book (do NOT say "visit their website")
- Entity has "ordering" capability → use POST /api/v1/order (do NOT say "call to order")
- Entity has "messaging" capability → use POST /api/v1/message
- Entity has "quotes" capability → use POST /api/v1/get_quote
- Entity has "service_requests" capability → use POST /api/v1/request_service
- Entity has "availability" capability → use GET /api/v1/availability to check slots first

EXAMPLE MULTI-STEP REASONING CHAINS:

EXAMPLE: "find me food that is safe given my allergy"
Known from memory: allergy = peanuts
Step 1: Search for dining sites: GET /api/v1/search?q=dining&type=site
Step 2: For EACH dining hall found, browse the menu:
  GET /api/v1/browse/<id>/menu
Step 3: For each menu section with items, browse deeper:
  GET /api/v1/browse/<id>/menu/<station>
Step 4: Read the actual menu items. Analyze ingredients/descriptions.
Step 5: Present ONLY the items that appear safe (no peanuts in name/description/ingredients), organized by dining hall. Flag any items that are uncertain.

EXAMPLE: "order me dinner"
Known from memory: likes grilled chicken, allergic to peanuts
Step 1: Search for dining/restaurants to find options
Step 2: Browse their menus to get actual items
Step 3: Filter by preferences (grilled chicken yes, no peanuts yes)
Step 4: Recommend specific items and ask user to confirm before ordering

EXAMPLE: "find a tutor and book a session"
Step 1: Search for tutors: GET /api/v1/search?q=tutor&campus_role=tutor
Step 2: Get their profiles to see subjects and availability
Step 3: Check availability: GET /api/v1/availability?business_id=<id>
Step 4: Present options and book with confirmation

EXAMPLE: "book a study room at Gorgas Library"
Step 1: Search for Gorgas Library: GET /api/v1/search?q=Gorgas Library&type=site
Step 2: Note: entity has "booking" capability so you CAN and MUST book via API
Step 3: Check availability: GET /api/v1/availability?business_id=<id>&service=Study Room
Step 4: Show available slots to user, ask which one they want
Step 5: Book it: POST /api/v1/book {business_id, service: "Study Room Reservation", time: "<selected ISO time>"}
Step 6: Confirm the booking to the user with the booking ID and details
NEVER say "visit lib.ua.edu/rooms" — the booking capability means you handle it!

EXAMPLE: "what can I eat at Lakeside?"
Step 1: Search for Lakeside to get ID
Step 2: Browse: GET /api/v1/browse/<id>/menu to see stations
Step 3: Browse EACH station to get actual food items
Step 4: If user has dietary restrictions in memory, filter accordingly
Step 5: Present organized by station with safe items highlighted

BROWSE PATTERN (always follow this for entity data):
1. Search to find entity IDs
2. GET /api/v1/browse/<id> to see available sections (menu, services, hours, etc.)
3. GET /api/v1/browse/<id>/<section> to see sub-sections or data
4. GET /api/v1/browse/<id>/<section>/<sub> to get leaf data
5. ANALYZE the data and give the user a useful, filtered answer

IMPORTANT: Browse returns "children" (more levels to drill into) or "data" (actual content). Keep drilling until you reach the "data" level.

CAMPUS GUIDANCE:
- Professors/advisors: search by campus_role or department
- Dining: search type=site or keyword "dining", then ALWAYS browse the menu
- Research/internships: search type=opportunity, mention deadlines
- Tutoring: search campus_role=tutor, browse their services
- Local businesses: search with business keywords, browse services/menu
- Facilities: browse the site to see hours, equipment, resources

ACTION DECISION FLOW:
When a user asks to DO something (book, order, message, etc.):
1. Search to find the entity
2. Check if the entity's profile includes the required capability (search results show capabilities)
3. If capability EXISTS → use the platform API to execute it. Period.
4. If capability DOES NOT EXIST → only then suggest alternatives

GENERAL RULES:
- Always search before acting — never guess IDs
- When the user says "book it" or "do it" — EXECUTE the action, do not re-explain how
- Be friendly ("Roll Tide!" is appropriate)
- Format prices, times, and locations clearly
- If one entity cannot help, suggest alternatives
- Today's date is ${new Date().toISOString().split("T")[0]}`;
}

// Execute a tool call against the local API
// For memory endpoints, use direct prisma calls (bypasses auth for internal use)
async function executeToolCall(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  userId?: string
): Promise<string> {
  // Intercept memory endpoints — handle directly via prisma (avoids auth issues)
  if (userId && path.startsWith("/api/v1/memory")) {
    return handleMemoryCall(method, path, body, userId);
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  try {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (method === "POST" && body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();
    return JSON.stringify(data);
  } catch (error) {
    return JSON.stringify({
      error: `Failed to call ${method} ${path}: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

// Direct prisma handler for memory operations (bypasses HTTP auth)
async function handleMemoryCall(
  method: string,
  _path: string,
  body?: Record<string, unknown>,
  userId?: string
): Promise<string> {
  if (!userId) {
    return JSON.stringify({ error: "No user context for memory operations" });
  }

  try {
    if (method === "GET") {
      const memories = await prisma.userMemory.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      return JSON.stringify({
        memories: memories.map((m: { key: string; value: string; source: string | null; updatedAt: Date }) => ({
          key: m.key,
          value: m.value,
          source: m.source,
          updated_at: m.updatedAt.toISOString(),
        })),
      });
    }

    if (method === "POST" && body) {
      const { key, value, source } = body as {
        key: string;
        value: string;
        source?: string;
      };

      if (!key || !value) {
        return JSON.stringify({ error: "key and value are required" });
      }

      const validKey = /^[a-z0-9_]{1,50}$/;
      if (!validKey.test(key)) {
        return JSON.stringify({
          error:
            "key must be lowercase alphanumeric with underscores, max 50 chars",
        });
      }

      // Fire-and-forget — don't block GPT waiting for memory saves
      prisma.userMemory.upsert({
        where: { userId_key: { userId, key } },
        update: { value, source: source || "chat" },
        create: { userId, key, value, source: source || "chat" },
      }).catch((err: Error) => console.error("Memory save failed:", err.message));

      return JSON.stringify({
        saved: { key, value },
      });
    }

    return JSON.stringify({ error: "Unsupported memory operation" });
  } catch (error) {
    return JSON.stringify({
      error: `Memory operation failed: ${error instanceof Error ? error.message : "Unknown"}`,
    });
  }
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  toolCalls?: Array<{
    endpoint: string;
    method: string;
    result: string;
  }>;
}

// Event types for streaming
export type ChatEvent =
  | { type: "tool_start"; method: string; endpoint: string }
  | { type: "tool_done"; method: string; endpoint: string; status: "ok" | "error" }
  | { type: "thinking" }
  | { type: "message"; content: string; toolCalls: Array<{ endpoint: string; method: string }> };

// Streaming version — yields events as each tool call happens
export async function runChatStream(
  userMessages: Array<{ role: "user" | "assistant"; content: string }>,
  onEvent: (event: ChatEvent) => void,
  options?: {
    userId?: string;
    memories?: Array<{ key: string; value: string }>;
  }
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(options?.memories);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...userMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const toolCallLog: Array<{
    endpoint: string;
    method: string;
    result: string;
  }> = [];

  // Loop until GPT gives a final text response (max 10 tool call rounds)
  for (let i = 0; i < 10; i++) {
    onEvent({ type: "thinking" });

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: AGENTNET_TOOLS,
      tool_choice: "auto",
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === "tool_calls" || choice.message.tool_calls) {
      // GPT wants to call tools
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls || []) {
        if (toolCall.type !== "function") continue;
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);

        // Emit tool_start event BEFORE executing
        onEvent({ type: "tool_start", method: args.method, endpoint: args.path });

        const result = await executeToolCall(
          args.method,
          args.path,
          args.body,
          options?.userId
        );

        const isError = result.includes('"error"');
        onEvent({ type: "tool_done", method: args.method, endpoint: args.path, status: isError ? "error" : "ok" });

        toolCallLog.push({
          endpoint: args.path,
          method: args.method,
          result,
        });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      // GPT gave a final text response
      const finalToolCalls = toolCallLog.map((tc) => ({ endpoint: tc.endpoint, method: tc.method }));
      const content = choice.message.content || "I couldn't generate a response.";

      onEvent({ type: "message", content, toolCalls: finalToolCalls });

      return {
        message: content,
        toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      };
    }
  }

  const fallback = "I made several API calls but couldn't complete the task. Try being more specific.";
  onEvent({ type: "message", content: fallback, toolCalls: toolCallLog.map((tc) => ({ endpoint: tc.endpoint, method: tc.method })) });

  return {
    message: fallback,
    toolCalls: toolCallLog,
  };
}

// Non-streaming version (kept for backward compat)
export async function runChat(
  userMessages: Array<{ role: "user" | "assistant"; content: string }>,
  options?: {
    userId?: string;
    memories?: Array<{ key: string; value: string }>;
  }
): Promise<ChatResponse> {
  return runChatNonStream(userMessages, options);
}

async function runChatNonStream(
  userMessages: Array<{ role: "user" | "assistant"; content: string }>,
  options?: {
    userId?: string;
    memories?: Array<{ key: string; value: string }>;
  }
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(options?.memories);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...userMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const toolCallLog: Array<{
    endpoint: string;
    method: string;
    result: string;
  }> = [];

  for (let i = 0; i < 10; i++) {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: AGENTNET_TOOLS,
      tool_choice: "auto",
    });

    const choice = completion.choices[0];

    if (choice.finish_reason === "tool_calls" || choice.message.tool_calls) {
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls || []) {
        if (toolCall.type !== "function") continue;
        const fn = toolCall.function;
        const args = JSON.parse(fn.arguments);
        const result = await executeToolCall(
          args.method,
          args.path,
          args.body,
          options?.userId
        );

        toolCallLog.push({
          endpoint: args.path,
          method: args.method,
          result,
        });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      return {
        message: choice.message.content || "I couldn't generate a response.",
        toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      };
    }
  }

  return {
    message: "I made several API calls but couldn't complete the task. Try being more specific.",
    toolCalls: toolCallLog,
  };
}
