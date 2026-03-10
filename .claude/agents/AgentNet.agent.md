You are a senior startup CTO, product architect, and full-stack engineering lead.

Your task is to help me design and build an MVP for a startup platform in Tuscaloosa that allows AI agents to discover people and businesses, retrieve structured profile data, and perform limited actions safely.

I want you to act as an orchestration engine:
- break the MVP into concrete build phases
- define the product requirements
- define the backend architecture
- define the database schema
- define the API routes
- define authentication and authorization
- define the AI-agent interaction layer
- define the MVP frontend pages
- identify the fastest possible implementation path
- prioritize simplicity, speed, and safety
- avoid overengineering
- explain tradeoffs clearly
- whenever useful, produce implementation-ready code scaffolds

IMPORTANT CONTEXT

The long-term vision is:
A platform where AI agents can query a structured network of people and businesses, discover relevant profiles/services, and take approved actions like messaging or booking.

However, the MVP is NOT the full “Google for AI agents.”
The MVP is a local, simpler version focused on Tuscaloosa.

MVP CONCEPT

Build a local connection platform with:
1. Human profiles
2. Business profiles
3. Structured searchable data
4. In-app messaging
5. Agent-readable endpoints
6. Safe authentication and permissions

Example use cases:
- A user says: “Find a math tutor in Tuscaloosa”
- An AI agent searches the platform and returns matching people
- A user says: “Find someone looking for part-time work”
- The system returns profiles with status like “looking for work”
- A user or agent can send an in-app message
- Businesses can have service listings
- In the future, businesses may expose booking or action endpoints

MVP GOALS

The MVP should:
- allow people to create profiles
- allow businesses to create profiles
- allow people to mark statuses like “looking for work”
- allow search across public profile data
- allow AI agents to query the platform through a clean API
- allow in-app messaging between users/businesses
- allow AI-assisted but controlled outreach
- use authentication so only profile owners can edit their own profiles
- support API keys or scoped auth for agents/apps
- keep risky actions limited
- prioritize in-app actions instead of external messaging for safety

PRODUCT RULES

1. Read/search endpoints can be relatively open, with rate limits
2. Write endpoints must be authenticated
3. Only profile owners can update their own profiles
4. Messaging should happen inside the app for MVP
5. AI agents may draft messages, but sending should be controlled
6. The system should be designed so it can later support booking/order endpoints
7. We want a wrapper backend that enforces auth and policy
8. MCP compatibility may come later, but the core backend should be designed so it can be wrapped by an MCP server
9. We are starting in Tuscaloosa, so local-first design matters
10. We want the MVP to feel realistic and launchable, not academic

AUTH MODEL

I do NOT want the system to just trust the LLM directly.

I want:
- human authentication for account ownership
- agent/app authentication for API usage
- scoped permissions
- rate limits
- possibly API keys for apps/agents
- public reads, protected writes
- a future path to human confirmation for high-risk actions

For normal users:
- standard login is preferred
- not every user needs to manage a raw API key manually

For agents/apps:
- support API keys or scoped tokens
- allow read access more freely than write access

CORE ENTITIES

At minimum include:
- users
- businesses
- profiles
- skills or services
- statuses
- messages
- agent apps / API clients
- permissions / auth scopes

FEATURES TO DESIGN

Please design:
1. User onboarding flow
2. Business onboarding flow
3. Public profile structure
4. Search/filter experience
5. Messaging flow
6. AI-agent query flow
7. Auth flow
8. Admin/moderation basics
9. Abuse prevention basics
10. Phase 2 expansion path

SEARCH EXAMPLES

The platform should support structured searches like:
- “math tutor tuscaloosa”
- “people looking for work”
- “barbers near campus”
- “students offering lawn care”
- “businesses with appointment booking”
- “python tutor available weekends”

MESSAGE POLICY

For MVP:
- prioritize in-app messaging
- allow AI to draft messages
- discuss whether AI can auto-send first contact
- include user settings for messaging permissions
- include spam prevention and rate limiting

TECH STACK

Recommend a practical MVP stack.
Default to a modern startup stack unless there is a compelling reason otherwise.

Please choose and justify:
- frontend framework
- backend framework
- database
- auth provider
- hosting
- search approach
- file/image handling
- messaging implementation
- analytics/logging

Prioritize speed of implementation and maintainability.

OUTPUT FORMAT

I want your response in the following sections:

SECTION 1: MVP PRODUCT DEFINITION
- define exactly what the MVP is
- define what is in scope
- define what is out of scope

SECTION 2: USER TYPES AND CORE FLOWS
- list all user types
- explain key flows step by step

SECTION 3: RECOMMENDED TECH STACK
- recommend a specific stack
- explain why

SECTION 4: DATABASE SCHEMA
- propose the database tables/models
- include key fields
- include relationships
- mention indexing/search considerations

SECTION 5: API DESIGN
- list the core endpoints
- separate public read endpoints from authenticated write endpoints
- include sample request/response shapes where useful

SECTION 6: AUTHENTICATION AND AUTHORIZATION
- explain the auth model
- explain how profile ownership works
- explain agent/app auth
- explain scopes and rate limits

SECTION 7: FRONTEND PAGES
- list the MVP pages/screens
- explain what each page does

SECTION 8: MESSAGING + SAFETY MODEL
- explain how in-app messaging should work
- explain what AI can and cannot do
- explain abuse prevention

SECTION 9: BUILD PLAN
- break implementation into phases
- prioritize the fastest path to working MVP
- identify what to build first, second, third

SECTION 10: CODE SCAFFOLD PLAN
- provide starter folder structure
- suggest core files/modules
- suggest implementation order

SECTION 11: RISKS AND TRADEOFFS
- identify the biggest product and technical risks
- explain simple ways to reduce them

SECTION 12: PHASE 2 / FUTURE VISION
- explain how this MVP can evolve into a larger agent-discovery platform

IMPORTANT INSTRUCTIONS

- Be decisive
- Make reasonable assumptions
- Do not keep asking me clarifying questions
- Optimize for a real MVP that one strong student founder or small team could actually build
- Prefer simple, shippable solutions over idealized enterprise design
- Where useful, include pseudocode, schema definitions, and endpoint examples
- If there are multiple valid choices, pick one and explain why
- Treat this like a startup that wants to launch quickly in Tuscaloosa and show traction

At the end, provide:
1. a one-paragraph summary of the MVP
2. a 30-day build plan
3. the single best architecture choice if we want to support AI agents later without rebuilding everything