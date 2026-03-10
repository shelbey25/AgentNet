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
      ? `\n\nUSER'S SAVED PREFERENCES (from memory — use these proactively):\n${memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")}\n\nYou ALREADY KNOW the above facts about this user. Use them automatically — do NOT ask the user to repeat information you already have. For example, if you know their allergy, factor it into every food recommendation without being asked.`
      : `\n\nThe user has no saved preferences yet. When they mention preferences (allergies, major, interests, dietary needs, schedule), save them to memory using POST /api/v1/memory so you remember next time.`;

  return `You are BamaAgent, the AI assistant for the University of Alabama campus and Tuscaloosa community. You help students, faculty, and visitors navigate campus life.

You have access to the AgentNet platform API via the agentnet_api tool. The platform has four entity types:
- **person**: professors, students, tutors, advisors, staff
- **business**: local Tuscaloosa businesses (barbershops, restaurants, coffee shops)
- **site**: campus locations (dining halls, libraries, rec centers) with menus, hours, facilities
- **opportunity**: research positions, internships, scholarships, jobs
${memoryBlock}

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

GENERAL RULES:
- Always search before acting — never guess IDs
- Confirm with user before executing bookings/orders
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

      const memory = await prisma.userMemory.upsert({
        where: { userId_key: { userId, key } },
        update: { value, source: source || "chat" },
        create: { userId, key, value, source: source || "chat" },
      });

      return JSON.stringify({
        saved: { key: memory.key, value: memory.value },
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

// Run a multi-turn GPT conversation with tool calling
export async function runChat(
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

  // Loop until GPT gives a final text response (max 10 tool call rounds)
  for (let i = 0; i < 10; i++) {
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
      // GPT gave a final text response
      return {
        message: choice.message.content || "I couldn't generate a response.",
        toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      };
    }
  }

  return {
    message:
      "I made several API calls but couldn't complete the task. Try being more specific.",
    toolCalls: toolCallLog,
  };
}
