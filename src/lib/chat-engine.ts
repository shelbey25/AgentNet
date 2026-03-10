// GPT Chat Engine — gives GPT function-calling access to the AgentNet API
// The MCP pattern: GPT gets a single tool that can call any platform endpoint
// Agent → GPT → agentnet_api tool → localhost HTTP call → response → GPT reasons

import OpenAI from "openai";

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
      description: `Execute an API call on the AgentNet platform. This tool lets you interact with the platform to search for businesses/people, get their info, check availability, book appointments, place orders, send messages, request services, and get quotes. All in Tuscaloosa, AL.

Available endpoints:

SEARCH & DISCOVERY:
- GET /api/v1/search?q=<query>&type=<person|business>&status=<available|hiring|looking_for_work>&capability=<ordering|booking|quotes|availability>
  Search for businesses, people, and services. Returns IDs, capabilities, and available actions.

PROFILE:
- GET /api/v1/profile/<id>
  Get full profile with capabilities, services, and available action endpoints.

INFO SECTIONS (structured business data):
- GET /api/v1/info/<business_id>
  List all info sections (menu, services, hours, etc.)
- GET /api/v1/info/<business_id>/<section>
  Get specific section data (e.g., /info/<id>/menu, /info/<id>/services, /info/<id>/hours)

ACTIONS:
- GET /api/v1/availability?business_id=<id>&date=<YYYY-MM-DD>&service=<name>
  Check available time slots.
- POST /api/v1/book  body: {"business_id":"<id>","service":"<name>","time":"<ISO datetime>"}
  Book an appointment.
- POST /api/v1/order  body: {"business_id":"<id>","items":[{"id":"<item_id>","qty":<n>}],"pickup_time":"<HH:MM>"}
  Place an order.
- POST /api/v1/message  body: {"recipient_id":"<id>","message":"<text>","subject":"<subject>"}
  Send a message.
- POST /api/v1/request_service  body: {"provider_id":"<id>","service":"<name>","time_preference":"<pref>"}
  Request a service.
- POST /api/v1/get_quote  body: {"business_id":"<id>","service":"<name>","details":{...}}
  Request a price quote.

IMPORTANT:
- Always search first to find business/person IDs before taking actions.
- Use the profile endpoint to see what capabilities a business supports.
- Use the info endpoint to get menus, services lists, and details before ordering/booking.
- Dates use YYYY-MM-DD format. Times use ISO 8601 or HH:MM format.`,
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

const SYSTEM_PROMPT = `You are AgentNet Assistant, an AI helper for Tuscaloosa, Alabama. You help users find local businesses, people, and services, and can take actions like booking appointments, placing orders, checking availability, sending messages, requesting services, and getting quotes.

You have access to the AgentNet platform API through the agentnet_api tool. Use it to:
1. Search for businesses and people
2. Get their profiles and info sections  
3. Take actions on their behalf

WORKFLOW:
- When a user asks about a business or service, SEARCH first to find relevant results
- Then GET the profile to see capabilities and services
- Then GET info sections (like /menu or /services) for detailed data
- Then perform the requested action (book, order, quote, etc.)

RULES:
- Always search before acting — never guess IDs
- Show the user what you found before taking actions
- For bookings and orders, confirm details with the user before executing
- Be conversational and helpful
- Format prices, times, and addresses clearly
- If a business doesn't support a capability, tell the user and suggest alternatives
- Today's date is ${new Date().toISOString().split("T")[0]}`;

// Execute a tool call against the local API
async function executeToolCall(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<string> {
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
  userMessages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ChatResponse> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
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
          args.body
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
