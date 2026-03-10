# AgentNet

**A normalized action layer between AI agents, campus entities, and local businesses.**

AgentNet is a Bama-first campus MVP built for the University of Alabama. It provides a conversational AI interface (powered by GPT-4o) that connects students with professors, advisors, tutors, dining halls, campus facilities, local businesses, and opportunities — all through a single chat experience. Entities on the platform can receive real-time webhook notifications when users interact with them (bookings, orders, messages, etc.).

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Entity Types](#entity-types)
- [Chat Engine](#chat-engine)
- [Adapter System](#adapter-system)
- [Webhook System](#webhook-system)
- [Entity Ownership](#entity-ownership)
- [API Reference](#api-reference)
- [Pages & UI](#pages--ui)
- [Seed Data](#seed-data)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Project Structure](#project-structure)

---

## Architecture Overview

```
User ──► Chat UI ──► GPT-4o (function calling) ──► Platform API ──► Dispatcher
                                                                       │
                                                         ┌─────────────┼─────────────┐
                                                         ▼             ▼             ▼
                                                   Local Handler  Named Adapter  Generic REST
                                                   (Prisma DB)   (Square, etc.) (External API)
                                                         │             │             │
                                                         └─────────────┼─────────────┘
                                                                       ▼
                                                                 Webhook Delivery
                                                                 (async, HMAC-signed)
```

The platform acts as a **normalized action layer** — the AI agent doesn't need to know how each business or entity works internally. It calls a single `agentnet_api` tool with a standard path/method/body, and the dispatcher routes the action to the correct handler (local database, external API, or named integration).

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL (Railway) | — |
| ORM | Prisma (driver adapter: `@prisma/adapter-pg`) | 7.4.2 |
| Auth | NextAuth v5 (Credentials, JWT sessions) | 5.0.0-beta.30 |
| AI | OpenAI SDK (GPT-4o, function calling) | 6.27.0 |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` | 4.x |
| Chat Rendering | react-markdown + remark-gfm | 10.1.0 |
| Password Hashing | bcryptjs | 3.x |

---

## Data Model

**20 models, 12 enums** defined in `prisma/schema.prisma` (570 lines).

### Core Models

| Model | Purpose |
|-------|---------|
| **User** | Authentication account (email, password, role). One user can own multiple profiles. |
| **Profile** | Universal entity — can represent a person, business, site, or opportunity. Has webhook config. |
| **Capability** | Declares what actions a profile supports (ordering, booking, messaging, etc.) |
| **Service** | Services offered by a profile (haircuts, tutoring sessions, etc.) |
| **Skill** | Skills for person-type profiles (Python, Data Analysis, etc.) |
| **InfoSection** | Structured hierarchical data (menus, hours, FAQs, policies) |
| **BusinessEndpoint** | External API endpoints for businesses with their own backend |

### Action Models

| Model | Purpose |
|-------|---------|
| **Order** | Food/product orders with status tracking |
| **Booking** | Appointment bookings with date/time |
| **ServiceRequest** | Service request submissions |
| **Quote** | Price quote requests and responses |
| **Message** | Direct messages between users (supports drafts) |

### Platform Models

| Model | Purpose |
|-------|---------|
| **ChatSession / ChatMessage** | Persistent chat conversation storage |
| **UserMemory** | Key-value memory store for user preferences (major, year, interests) |
| **ActionLog** | Audit trail for all platform actions |
| **WebhookLog** | Webhook delivery tracking (status, response, errors) |
| **ApiKey** | API key management for programmatic access |
| **MessageSettings** | Per-user message preferences (allow messages, require approval) |
| **ConnectedAccount** | Scaffolding for OAuth integrations (Outlook, Gmail, Canvas) |
| **ClaimRequest** | Workflow for users to claim pre-seeded profiles |

### Enums

`UserRole` · `EntityType` · `CampusRole` · `OpportunityType` · `ProfileStatus` · `CapabilityType` · `OrderStatus` · `BookingStatus` · `ServiceRequestStatus` · `QuoteStatus` · `IntegrationType` · `PaymentMode`

---

## Entity Types

AgentNet supports four entity types, all stored as `Profile` records:

### Person
Professors, students, tutors, advisors. Has campus-specific fields: `campusRole`, `department`, `title`, `officeLocation`, `officeHours`.

### Business
Local businesses (barbershops, restaurants, coffee shops). Has integration fields: `integrationType`, `paymentMode`. Supports booking, ordering, quotes.

### Site
Campus facilities (dining halls, libraries, rec centers). Has info sections for hours, menus, resources, policies.

### Opportunity
Research positions, internships, scholarships, jobs. Has `opportunityType`, `deadline`, `eligibility`, `compensation`, `applyUrl`.

---

## Chat Engine

The chat interface (`src/lib/chat-engine.ts`) uses **GPT-4o with function calling**. The AI agent has a single tool — `agentnet_api` — that can call any platform endpoint.

### How it works

1. User sends a message in the chat UI
2. GPT-4o decides which API call(s) to make using the `agentnet_api` function
3. The platform executes the API call and returns results to GPT-4o
4. GPT-4o formats the response in natural language with markdown

### Agent Identity

The agent identifies as **BamaAgent** — a campus assistant for University of Alabama students. It follows a **browse-first workflow**: when a user asks about an entity, the agent first browses its info sections to get accurate data before responding.

### Supported Actions via Chat

- **Search** — Find people, businesses, sites, opportunities by keyword, type, or category
- **Browse** — Navigate entity info hierarchically (menu → appetizers → item details)
- **Book** — Schedule appointments (office hours, haircuts, study rooms)
- **Order** — Place food/product orders with item selection
- **Message** — Send messages to entities or users
- **Get Quote** — Request price quotes from service providers
- **Request Service** — Submit service requests (tutoring, repairs, etc.)
- **Memory** — Store/recall user preferences (schedule, major, dining preferences)

---

## Adapter System

The dispatcher (`src/lib/adapters/dispatcher.ts`) routes actions through a priority chain:

```
1. Check capability exists and is active
2. Check for external business endpoint
3. If external → use named adapter (Square, Calendly, etc.) or generic REST
4. If no external → handle locally via Prisma
```

### Adapter Types

| Adapter | File | Purpose |
|---------|------|---------|
| **Local** | `adapters/local.ts` | Creates records in the platform database |
| **Generic REST** | `adapters/generic-rest.ts` | Forwards to any external REST API |
| **Named Adapters** | `adapters/named-adapters.ts` | Integration-specific logic (Square, Calendly, Shopify, Toast, Stripe) |

### Integration Types
`custom` · `square` · `calendly` · `shopify` · `toast` · `stripe_checkout` · `manual`

### Payment Modes
`checkout_url` · `business_api_charge` · `pay_on_pickup` · `invoice_later` · `unsupported`

---

## Webhook System

Entities can configure a webhook URL to receive real-time notifications when users interact with them.

### Configuration

Each profile has:
- `webhookUrl` — HTTPS endpoint to receive POST requests
- `webhookSecret` — Secret key for HMAC-SHA256 payload signing
- `webhookEnabled` — Master toggle
- `enabledWebhookEvents[]` — Array of event types to subscribe to

### Event Types
`ordering` · `booking` · `messaging` · `service_requests` · `quotes` · `availability`

### Payload Format

```json
{
  "event": "booking",
  "entity_id": "profile-uuid",
  "entity_name": "Crimson Cuts Barbershop",
  "timestamp": "2026-03-10T15:30:00.000Z",
  "data": {
    "service": "Haircut",
    "date": "2026-03-12",
    "time": "2:00 PM",
    "result": {
      "booking_id": "uuid",
      "status": "pending"
    }
  }
}
```

### Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `X-AgentNet-Event` | Event type (e.g., `booking`) |
| `X-AgentNet-Entity` | Profile ID |
| `X-AgentNet-Timestamp` | ISO 8601 timestamp |
| `X-AgentNet-Signature` | `sha256=<hmac>` (if secret configured) |

### Verification

```javascript
const crypto = require('crypto');
const signature = crypto.createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex');
const isValid = `sha256=${signature}` === req.headers['x-agentnet-signature'];
```

Webhooks are delivered asynchronously (fire-and-forget) with a 10-second timeout. All deliveries are logged in the `WebhookLog` model for debugging.

---

## Entity Ownership

- **One email can own multiple entities.** A single user account (email) can control multiple profiles — e.g., a business owner with two restaurants, or a professor who also runs a consulting business.
- **Only the owner email can control an entity.** Settings, webhook config, and profile edits require authentication as the owning user.
- **Pre-seeded entities are claimable.** Campus entities (professors, dining halls) are seeded with placeholder accounts. Real owners can submit claim requests to take control.

### Managing Entities

```bash
# List your entities
GET /api/v1/my-entities

# Create a new entity
POST /api/v1/entity
{ "type": "business", "displayName": "My Restaurant", "category": "dining" }

# Configure webhooks
PATCH /api/v1/entity/:id/settings
{
  "webhookUrl": "https://mysite.com/webhook",
  "webhookSecret": "my-secret-key",
  "webhookEnabled": true,
  "enabledWebhookEvents": ["ordering", "booking"]
}

# View webhook delivery logs
GET /api/v1/entity/:id/webhooks
```

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Create account (creates user + first profile) |
| POST | `/api/auth/[...nextauth]` | Public | NextAuth sign-in/sign-out/session |

### Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chat` | Public | Send message to GPT-4o chat engine |
| POST | `/api/chat/session` | Optional | Create/list chat sessions |

### Current User (`/api/me`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/me` | Required | Get user + all profiles |
| PUT | `/api/me/profile` | Required | Update profile (accepts optional `profileId`) |
| GET/POST | `/api/me/skills` | Required | List/add skills |
| DELETE | `/api/me/skills/:id` | Required | Remove skill |
| GET/POST | `/api/me/services` | Required | List/add services |
| DELETE | `/api/me/services/:id` | Required | Remove service |

### Entity Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/entity` | Required | Create new entity |
| GET | `/api/v1/my-entities` | Required | List owned entities |
| GET | `/api/v1/entity/:id/settings` | Owner | View entity settings + webhook config |
| PATCH | `/api/v1/entity/:id/settings` | Owner | Update webhook URL, secret, enabled events |
| GET | `/api/v1/entity/:id/webhooks` | Owner | View webhook delivery logs |

### Browse & Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/browse/:entityId/[...path]` | Public | Hierarchical entity data navigation |
| GET | `/api/v1/search` | Public | Search profiles by type, category, capability, keyword |
| GET | `/api/v1/search/text` | Public | Full-text search across profiles |
| GET | `/api/v1/info/:businessId` | Public | Get entity info sections |
| GET | `/api/v1/info/:businessId/:path` | Public | Get specific info section |

### Actions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/book` | Public | Book an appointment |
| GET | `/api/v1/booking/:id` | Public | Check booking status |
| POST | `/api/v1/order` | Public | Place an order |
| GET | `/api/v1/order/:id` | Public | Check order status |
| POST | `/api/v1/get_quote` | Public | Request a price quote |
| GET | `/api/v1/quote/:id` | Public | Check quote status |
| POST | `/api/v1/request_service` | Public | Submit a service request |
| GET | `/api/v1/availability` | Public | Check entity availability |
| POST | `/api/v1/message` | Public | Send a message |
| GET | `/api/v1/message/:id` | Public | Get message details |

### Business

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/business/onboard` | Required | Register/update a business profile |
| POST | `/api/v1/claim` | Required | Submit a claim request for an entity |
| GET | `/api/v1/claim` | Required | List your claim requests |

### User Data

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/v1/memory` | Required | List/store user memory |
| GET/PUT/DELETE | `/api/v1/memory/:key` | Required | Get/update/delete a memory entry |
| GET/POST | `/api/v1/connected-accounts` | Required | Manage connected accounts |
| GET/POST | `/api/messages` | Required | Dashboard message list |
| PATCH | `/api/messages/:id` | Required | Mark message read, approve draft |

### Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/profile/:id` | Public | Get public profile |
| GET | `/api/v1/profiles/:id` | Public | Get detailed profile with capabilities |
| POST | `/api/v1/messages/draft` | Public | Agent-initiated draft messages |
| GET/POST | `/api/keys` | Required | API key management |
| DELETE | `/api/keys/:id` | Required | Revoke API key |

---

## Pages & UI

| Path | Description |
|------|-------------|
| `/` | Main chat interface — conversational AI with markdown rendering, suggestion buttons, campus branding |
| `/auth/login` | Sign in with email/password |
| `/auth/register` | Create account (person or business) |
| `/dashboard` | Profile editor — update bio, location, status, skills, services |
| `/dashboard/messages` | Message inbox — read, approve/reject agent drafts |
| `/dashboard/keys` | API key management — create, revoke |
| `/search` | Browse/search campus entities with filters |
| `/profile/:id` | Public profile page |
| `/docs` | Interactive API documentation |

---

## Seed Data

The seed (`prisma/seed.ts`, 1826 lines) populates the database with 21 realistic University of Alabama campus entities:

### People (8)
| Entity | Role | Department |
|--------|------|------------|
| Dr. Sarah Mitchell | Professor | Computer Science |
| Dr. Carlos Rivera | Professor | Electrical Engineering |
| Dr. Ananya Patel | Professor | Data Science |
| Lisa Thompson | Advisor | Engineering |
| Marcus Williams | Advisor | Arts & Sciences |
| Jordan Lee | Tutor | Computer Science |
| Maya Chen | Tutor | Mathematics |
| Derek Washington | Tutor | Physics |

### Sites (4)
| Entity | Type |
|--------|------|
| Lakeside Dining Hall | Dining |
| Burke Dining Hall | Dining |
| Gorgas Library | Library |
| Student Recreation Center | Recreation |

### Opportunities (4)
| Entity | Type |
|--------|------|
| ML Research Assistant | Research |
| Software Engineering Intern | Internship |
| Robotics Lab Assistant | Research |
| STEM Excellence Scholarship | Scholarship |

### Businesses (3)
| Entity | Category |
|--------|----------|
| Crimson Cuts Barbershop | Barbershop |
| Black Warrior Coffee | Coffee Shop |
| The Chicken House | Restaurant |

### Students (2)
| Entity | Specialty |
|--------|-----------|
| Ashley Martinez | Graphic Design |
| Devon Brooks | Photography |

Each entity has full info sections (63 total), capabilities, services, skills, and hierarchical data for the browse endpoint.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Railway account)
- OpenAI API key

### Installation

```bash
git clone https://github.com/shelbey25/AgentNet.git
cd AgentNet
npm install
```

### Database Setup

```bash
# Set DATABASE_URL in .env
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-..."
```

---

## Development

```bash
# Start dev server (Turbopack)
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npx next build

# Prisma Studio (visual DB browser)
npx prisma studio

# Reset and reseed database
npx prisma migrate reset
npx tsx prisma/seed.ts
```

---

## Project Structure

```
AgentNet/
├── prisma/
│   ├── schema.prisma          # 20 models, 12 enums (570 lines)
│   ├── seed.ts                # 21 campus entities (1826 lines)
│   ├── prisma.config.ts       # Prisma driver adapter config
│   └── migrations/            # 4 migrations
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Chat UI (main interface)
│   │   ├── layout.tsx         # Root layout + session provider
│   │   │
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth + registration
│   │   │   ├── chat/          # GPT-4o chat endpoint + sessions
│   │   │   ├── me/            # Current user routes (profile, skills, services)
│   │   │   ├── keys/          # API key management
│   │   │   ├── messages/      # Dashboard message routes
│   │   │   ├── profiles/      # Profile lookup
│   │   │   ├── search/        # Dashboard search
│   │   │   └── v1/            # Public API (26 routes)
│   │   │       ├── availability/
│   │   │       ├── book/
│   │   │       ├── browse/    # Hierarchical entity navigation
│   │   │       ├── business/  # Business onboarding
│   │   │       ├── claim/     # Profile claim flow
│   │   │       ├── entity/    # Entity management + webhooks
│   │   │       ├── get_quote/
│   │   │       ├── info/      # Entity info sections
│   │   │       ├── memory/    # User memory store
│   │   │       ├── message/
│   │   │       ├── my-entities/
│   │   │       ├── order/
│   │   │       ├── profile/
│   │   │       ├── profiles/
│   │   │       ├── quote/
│   │   │       ├── request_service/
│   │   │       └── search/
│   │   │
│   │   ├── auth/              # Login + register pages
│   │   ├── dashboard/         # Dashboard + messages + API keys
│   │   ├── docs/              # API documentation page
│   │   ├── profile/           # Public profile page
│   │   └── search/            # Search page
│   │
│   └── lib/
│       ├── auth.ts            # NextAuth config (credentials, JWT)
│       ├── db.ts              # Prisma client singleton
│       ├── chat-engine.ts     # GPT-4o function calling engine
│       ├── webhook.ts         # HMAC-signed webhook delivery
│       ├── api-auth.ts        # Rate limiting + API key validation
│       ├── cache.ts           # In-memory cache utility
│       └── adapters/
│           ├── dispatcher.ts  # Action routing + webhook firing
│           ├── local.ts       # Local DB handlers
│           ├── generic-rest.ts # Generic external API adapter
│           ├── named-adapters.ts # Square, Calendly, etc.
│           ├── base.ts        # Adapter interface + registry
│           └── index.ts       # Barrel exports
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## License

Private — University of Alabama project.
