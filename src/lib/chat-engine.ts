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
      description: `Execute an API call on the AgentNet platform. This tool lets you interact with the University of Alabama campus and Tuscaloosa community. You can find professors, advisors, tutors, dining halls, research opportunities, internships, scholarships, local businesses, and more. You can book appointments, check availability, send messages, request services, and get quotes.

Entity types:
- person: professors, students, tutors, advisors, staff
- business: local businesses (barbershops, restaurants, etc.)
- site: dining halls, libraries, rec centers, campus buildings
- opportunity: research positions, internships, scholarships, jobs

Available endpoints:

SEARCH & DISCOVERY:
- GET /api/v1/search?q=<query>&type=<person|business|site|opportunity>&status=<available|hiring|looking_for_work>&capability=<ordering|booking|quotes|availability>&category=<restaurant|salon|etc>&campus_role=<professor|student|tutor|advisor>&department=<Computer Science|etc>&opportunity_type=<research|internship|scholarship|job>
  Search across all entity types. Returns IDs, capabilities, campus fields, and available actions.

BROWSE (hierarchical drill-down — preferred for menus, services, facilities, etc.):
- GET /api/v1/browse/<entity_id>
  Get entity overview + list of available data sections (menu, services, hours, facilities, etc.)
  Response includes "children" array with section names and paths.
- GET /api/v1/browse/<entity_id>/<section>
  Drill into a section. If it has sub-sections, returns "children" array.
  If it's a leaf, returns "data".
- GET /api/v1/browse/<entity_id>/<section>/<subsection>
  Get the actual data (e.g., specific menu items, facility details).

IMPORTANT: Use browse BEFORE the full info endpoint. Browse returns only what you need at each level, keeping responses small. Follow the paths returned in each response to drill deeper.

Example browse flow:
1. GET /api/v1/browse/<coffee_shop_id> → sections: [menu, hours]
2. GET /api/v1/browse/<coffee_shop_id>/menu → children: [hot_drinks, cold_drinks, food]
3. GET /api/v1/browse/<coffee_shop_id>/menu/hot_drinks → data: {items: [Latte, Cappuccino, ...]}

PROFILE:
- GET /api/v1/profile/<id>
  Get full profile with capabilities, services, campus info (department, title, office hours), or opportunity details (deadline, eligibility, compensation).

INFO SECTIONS (full data dump — use browse instead when possible):
- GET /api/v1/info/<entity_id>
  List all info sections
- GET /api/v1/info/<entity_id>/<section>
  Get specific section data
- GET /api/v1/info/<entity_id>/<section>/<subsection>
  Get a subsection

ACTIONS:
- GET /api/v1/availability?business_id=<id>&date=<YYYY-MM-DD>&service=<name>
  Check available time slots.
- POST /api/v1/book  body: {"business_id":"<id>","service":"<name>","time":"<ISO datetime>"}
  Book an appointment.
- POST /api/v1/order  body: {"business_id":"<id>","items":[{"id":"<item_id>","qty":<n>}],"pickup_time":"<HH:MM>"}
  Place an order (dining, restaurants, etc.)
- POST /api/v1/message  body: {"recipient_id":"<id>","message":"<text>","subject":"<subject>"}
  Send a message to any entity.
- POST /api/v1/request_service  body: {"provider_id":"<id>","service":"<name>","time_preference":"<pref>"}
  Request a service.
- POST /api/v1/get_quote  body: {"business_id":"<id>","service":"<name>","details":{...}}
  Request a price quote.

STATUS / FOLLOW-UP:
- GET /api/v1/order/<order_id>          — Get order status
- GET /api/v1/booking/<booking_id>      — Get booking status
- GET /api/v1/quote/<quote_id>          — Get quote status
- GET /api/v1/message/<message_id>      — Get message delivery status

USER MEMORY (personalization):
- GET /api/v1/memory                    — Get user's saved preferences
- POST /api/v1/memory  body: {"key":"<key>","value":"<value>"}  — Save a preference

IMPORTANT:
- Always search first to find entity IDs, then browse to explore their data.
- Use browse to progressively drill into menus, services, facilities — don't fetch everything at once.
- Follow the "children" paths in browse responses to go deeper.
- Only fetch the sections relevant to the user's question.
- For campus questions about professors/advisors, search by campus_role or department.
- For dining, search type=site, then browse into menu > specific station.
- After placing an order, check the payment_mode and next_step in the response.
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

const SYSTEM_PROMPT = `You are BamaAgent, the AI assistant for the University of Alabama campus and Tuscaloosa community. You help students, faculty, and visitors navigate campus life — finding professors, advisors, tutors, dining options, research opportunities, internships, scholarships, local businesses, and more.

You have access to the AgentNet platform API through the agentnet_api tool. The platform has four entity types:
- **person**: professors, students, tutors, advisors, staff (with department, title, office hours)
- **business**: local Tuscaloosa businesses (barbershops, restaurants, coffee shops, etc.)
- **site**: campus locations (dining halls, libraries, rec centers) with menus and hours
- **opportunity**: research positions, internships, scholarships, jobs (with deadlines, eligibility, compensation)

WORKFLOW:
1. When a user asks about something, SEARCH first to find relevant results
2. Use filters: type= (person/business/site/opportunity), campus_role= (professor/advisor/tutor), department=, opportunity_type=
3. BROWSE the entity to see what data sections are available (menus, services, facilities, etc.)
4. Drill into the specific section the user cares about — do NOT fetch everything at once
5. Use the profile endpoint only when you need capabilities or basic contact info
6. Perform actions (book office hours, order food, request tutoring, send messages)

BROWSE PATTERN (use this for menus, services, facilities, course lists, etc.):
- First: GET /api/v1/browse/<id> to see available sections
- Then: follow the "children" paths to drill into the section the user needs
- Example for "what desserts does Lakeside have?":
  1. Search for Lakeside → get ID
  2. Browse /api/v1/browse/<id>/menu → see station sub-sections
  3. Browse /api/v1/browse/<id>/menu/desserts → get actual dessert items
- This keeps responses small and focused

CAMPUS-SPECIFIC GUIDANCE:
- For "who teaches X": search with the subject as query and campus_role=professor  
- For "where to eat": search with type=site or keyword "dining"
- For "research opportunities": search with type=opportunity&opportunity_type=research
- For "I need a tutor": search with campus_role=tutor or keyword "tutoring"
- For "advising appointment": search campus_role=advisor, then book
- For local businesses: search as before with business keywords

RULES:
- Always search before acting — never guess IDs
- Show the user what you found before taking actions
- For bookings and orders, confirm details with the user before executing
- Be friendly and campus-oriented ("Roll Tide!" is appropriate)
- Format prices, times, and locations clearly
- Mention deadlines for opportunities
- If an entity doesn't support a capability, suggest alternatives
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
