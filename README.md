# BamaAdvisor

**AI Academic Advisor for The University of Alabama**

BamaAdvisor is an AI-powered academic advising platform built for UA students. Powered by GPT-4o and the AgentNet platform, it provides personalized degree planning, research matching, scholarship discovery, resume review, and career guidance — all through a conversational chat interface.

Built with Next.js 14, Prisma, PostgreSQL, and OpenAI.

---

## Features

### 🎓 Degree Planning
- Personalized course sequences based on major, interests, and graduation timeline
- Prerequisite chain analysis and semester-by-semester plans
- Full UA Course Catalog with CS, Math, Finance, and ME courses

### 🔬 Research Matching
- Connect with professors based on research alignment
- Browse lab openings and research assistant positions
- Draft introduction emails to professors via the platform

### 💰 Scholarship & Opportunity Finder
- Match with scholarships based on GPA, major, and background
- Browse internships, research positions, and jobs
- Intelligent opportunity matching engine with scoring

### 📄 Resume & Career Guidance
- Upload resume for GPT-powered parsing and analysis
- Upload transcript for course history extraction
- Submit personal essays for goal/interest identification
- Matched career path recommendations

### ☀️ Summer Strategy
- Strategic summer planning (internships, research, study abroad, courses)
- Recommendations based on year, major, and career goals

### 🤝 Student Initiatives
- Find or create clubs, projects, and startups
- Tag-based discovery and filtering
- "Looking for" matching (developers, designers, researchers)

### 🛡️ Admin Dashboard
- Platform statistics (students, profiles, opportunities, matches)
- Natural language data updates via GPT
- Opportunity push-matching to eligible students

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL (Railway) |
| ORM | Prisma |
| AI | OpenAI GPT-4o (function calling) |
| Auth | NextAuth.js (Credentials + JWT) |
| Styling | Tailwind CSS (UA Crimson theme) |
| Streaming | Server-Sent Events (SSE) |
| Passwords | bcryptjs |

---

## Architecture

```
User → Chat UI → SSE API Route → GPT-4o (with agentnet_api tool)
                                    ↓
                              AgentNet Platform API
                              (search, browse, profile, actions)
                                    ↓
                              PostgreSQL (Prisma)
```

The chat engine gives GPT a single function-calling tool (`agentnet_api`) that can invoke any platform API endpoint. GPT reasons about what data to fetch, chains multiple calls, and synthesizes advisor-quality responses.

---

## Data Model

### Core Entities
- **User** — students, admins (with role field)
- **Profile** — the universal entity (person, business, site, opportunity)
- **InfoSection** — hierarchical content (L0 → L1 → L2 tiered browsing)
- **Capability** — what an entity can do (booking, ordering, messaging)
- **Service** — services offered by entities

### Advisor-Specific Models
- **StudentPortfolio** — parsed resume, transcript, and essay data with matchTags
- **StudentInitiative** — student-led projects, clubs, and organizations
- **OpportunityMatch** — scored matches between students and opportunities
- **UserMemory** — persistent key-value preferences (major, GPA, courses, interests)

### Campus Roles
Profiles have a `campusRole` field: `professor`, `student`, `tutor`, `advisor`

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features, demo prompts, and CTA |
| `/chat` | AI advisor chat interface with SSE streaming |
| `/settings` | Document upload (resume, transcript, essay) |
| `/opportunities` | Browse and matched opportunities |
| `/initiatives` | Student initiatives with create/filter |
| `/admin` | Admin dashboard (stats, updates, push-matching) |
| `/browse` | Entity browsing (inherited from AgentNet) |
| `/dashboard` | User dashboard |

---

## API Routes

### Chat
- `POST /api/chat` — SSE streaming chat with GPT-4o

### Platform API (v1)
- `GET /api/v1/search` — search entities by type, role, department, etc.
- `GET /api/v1/browse/:id` — tiered browsing (L0/L1/L2)
- `GET /api/v1/profile/:id` — full entity profile
- `POST /api/v1/book` — book a service
- `POST /api/v1/order` — place an order
- `POST /api/v1/message` — send a message
- `POST /api/v1/request_service` — request a service
- `POST /api/v1/get_quote` — get a quote
- `GET /api/v1/availability` — check availability
- `GET/POST /api/v1/memory` — user preference storage

### Advisor API (v1)
- `GET /api/v1/portfolio` — get student's parsed portfolio
- `POST /api/v1/upload/resume` — upload and parse resume via GPT
- `POST /api/v1/upload/transcript` — upload and parse transcript via GPT
- `POST /api/v1/upload/essay` — submit and analyze personal essay via GPT
- `GET /api/v1/opportunities/matched` — get matched opportunities for current user
- `GET/POST /api/v1/initiatives` — browse or create student initiatives

### Admin API (v1)
- `GET /api/v1/admin/stats` — platform statistics
- `POST /api/v1/admin/update` — GPT-powered data updates via natural language
- `POST /api/v1/admin/push-opportunity` — push opportunity to matched students

---

## Chat Engine

The chat engine (`src/lib/chat-engine.ts`) is the AI brain:

1. **System Prompt** — BamaAdvisor persona with academic advising expertise
2. **Smart Memory Loading** — keyword-based memory selection (only loads relevant memories per message)
3. **Function Calling** — GPT uses `agentnet_api` tool to search, browse, and act on the platform
4. **Multi-Step Reasoning** — up to 10 tool calls per conversation for complex queries
5. **SSE Streaming** — real-time tool call visualization in the chat UI

### Memory System
- Identity keys (name, major, GPA, year) always loaded
- Topic keywords map to relevant memory keys
- GPT saves new preferences automatically during conversation
- Memory is persistent across sessions

---

## Seed Data

The seed script (`prisma/seed.ts`) populates the database with:

| Category | Count | Details |
|----------|-------|---------|
| Student | 1 | Shelbey Ousey (CS major, sophomore) |
| Admin | 1 | Platform administrator |
| CS Professors | 4 | Mitchell (AI), Chen (Security), Johnson (SE), Thompson (Vision) |
| Other Professors | 2 | Rivera (Finance), Park (ME) |
| Advisors | 2 | Wells (CS), Harris (Engineering) |
| Course Catalog | 1 | CS, Math, Finance, ME courses with prerequisites |
| Campus Sites | 5 | Lakeside Dining, Gorgas Library, Rec Center, Career Center, Grad School |
| Opportunities | 6 | Research positions, internships, scholarships, peer tutoring |
| Businesses | 1 | Crimson Cuts barbershop |
| Tutors | 1 | Jordan Taylor (CS/Math) |
| Student Memories | 28 | Shelbey's academic profile and preferences |
| Initiatives | 2 | AI Research Club, Open Source @ UA |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Railway recommended)
- OpenAI API key

### Setup

```bash
# Clone
git clone https://github.com/yourusername/AgentNet.git
cd AgentNet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:port/db
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Login Credentials (Seed Data)

| Role | Email | Password |
|------|-------|----------|
| Student | shelbeyousey@gmail.com | Born2007! |
| Admin | sbyousey@crimson.ua.edu | Born2007! |
| Others | (professor emails) | password123 |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── chat/page.tsx               # Chat interface
│   ├── settings/page.tsx           # Document upload
│   ├── opportunities/page.tsx      # Opportunity browsing
│   ├── initiatives/page.tsx        # Student initiatives
│   ├── admin/page.tsx              # Admin dashboard
│   ├── api/
│   │   ├── chat/route.ts           # SSE chat endpoint
│   │   └── v1/
│   │       ├── search/             # Entity search
│   │       ├── browse/             # Tiered browsing
│   │       ├── profile/            # Entity profiles
│   │       ├── portfolio/          # Student portfolio
│   │       ├── upload/             # Document upload (resume, transcript, essay)
│   │       ├── opportunities/      # Matched opportunities
│   │       ├── initiatives/        # Student initiatives
│   │       ├── admin/              # Admin routes
│   │       ├── memory/             # User preferences
│   │       └── ...                 # Actions (book, order, message, etc.)
│   └── layout.tsx
├── components/
│   └── navbar.tsx                  # Crimson-themed navigation
├── lib/
│   ├── chat-engine.ts              # GPT chat engine (BamaAdvisor brain)
│   ├── auth.ts                     # NextAuth configuration
│   └── db.ts                       # Prisma client
└── ...
prisma/
├── schema.prisma                   # Database schema
├── seed.ts                         # Seed script
└── prisma.config.ts                # Prisma configuration
```

---

## Color Scheme

UA Crimson theme:
- **Crimson**: `#9E1B32`
- **Crimson Dark**: `#7a1527`
- **Crimson Light**: `#c4324d`
- **Cream**: `#f2e6c9`

---

## License

MIT

---

**Roll Tide! 🐘**
