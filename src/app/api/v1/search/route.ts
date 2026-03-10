import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkPublicRateLimit,
  rateLimited,
} from "@/lib/api-auth";
import type { CapabilityType, Prisma } from "@prisma/client";

// ─── Keyword expansion (synonym map) ───────────────────
// Maps common user terms to additional search keywords
const SYNONYMS: Record<string, string[]> = {
  barber: ["barbershop", "haircut", "fade", "shave", "hair"],
  barbershop: ["barber", "haircut", "fade", "shave", "hair"],
  haircut: ["barber", "barbershop", "hair", "salon", "cuts"],
  salon: ["hair", "haircut", "braids", "stylist", "cosmetologist"],
  hair: ["barber", "barbershop", "salon", "haircut", "braids", "stylist"],
  food: ["restaurant", "chicken", "coffee", "menu", "order"],
  restaurant: ["food", "menu", "dine", "takeout", "order"],
  chicken: ["restaurant", "food", "wings", "tenders"],
  coffee: ["cafe", "latte", "espresso", "pastry"],
  cafe: ["coffee", "latte", "espresso"],
  tutor: ["tutoring", "math", "science", "writing", "education"],
  tutoring: ["tutor", "math", "science", "writing", "education"],
  auto: ["car", "repair", "mechanic", "oil", "brake"],
  car: ["auto", "repair", "mechanic", "vehicle"],
  mechanic: ["auto", "repair", "car", "brake", "oil"],
  repair: ["auto", "mechanic", "fix", "car"],
  clean: ["cleaning", "cleaner", "maid", "housekeeping"],
  cleaning: ["clean", "cleaner", "maid", "move-out"],
  trainer: ["fitness", "personal training", "gym", "workout"],
  fitness: ["trainer", "gym", "personal training", "workout"],
  design: ["graphic", "logo", "flyer", "creative"],
  lawn: ["landscaping", "mowing", "yard", "grass"],
  landscaping: ["lawn", "mowing", "yard", "tree"],
  handyman: ["repair", "fence", "gutter", "fix"],
  braids: ["hair", "salon", "locs", "stylist"],
  book: ["booking", "appointment", "schedule", "reserve"],
  appointment: ["booking", "book", "schedule"],
  order: ["ordering", "pickup", "takeout", "buy"],
};

// Expand a single term into itself + synonyms
function expandTerm(term: string): string[] {
  const lower = term.toLowerCase();
  const expanded = new Set<string>([lower]);
  if (SYNONYMS[lower]) {
    for (const syn of SYNONYMS[lower]) expanded.add(syn);
  }
  // Partial synonym matching — if term is a prefix/suffix of a synonym key
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (key.startsWith(lower) || lower.startsWith(key)) {
      expanded.add(key);
      for (const syn of syns) expanded.add(syn);
    }
  }
  return [...expanded];
}

// Build all search variants from a query string
function buildSearchTerms(query: string): string[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];

  const words = raw.split(/\s+/).filter(Boolean);
  const terms = new Set<string>();

  // 1. Full query as-is
  terms.add(raw);

  // 2. Words joined (no spaces) — catches "barber shop" → "barbershop"
  if (words.length > 1) {
    terms.add(words.join(""));
  }

  // 3. Each individual word
  for (const w of words) terms.add(w);

  // 4. Synonym-expand every word
  for (const w of words) {
    for (const expanded of expandTerm(w)) terms.add(expanded);
  }

  return [...terms];
}

// Valid capability types for filtering
const VALID_CAPABILITIES: Set<string> = new Set([
  "ordering", "booking", "messaging", "service_requests", "availability", "quotes",
]);

// GET /api/v1/search — unified search for agents and frontend
// Also aliased at /api/v1/search/text
// Supports keyword search with synonym expansion across all fields
export async function GET(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const capability = searchParams.get("capability");
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  // ─── Build WHERE ─────────────────────────────────────
  const andConditions: Prisma.ProfileWhereInput[] = [{ isPublic: true }];

  if (type === "person" || type === "business") {
    andConditions.push({ type });
  }

  if (status) {
    const validStatuses = ["available", "looking_for_work", "hiring", "busy"];
    if (validStatuses.includes(status)) {
      andConditions.push({ status: status as Prisma.EnumProfileStatusFilter });
    }
  }

  // Fix: properly cast capability to the CapabilityType enum
  if (capability && VALID_CAPABILITIES.has(capability)) {
    andConditions.push({
      capabilities: {
        some: { type: capability as CapabilityType, isActive: true },
      },
    });
  }

  if (category) {
    andConditions.push({
      OR: [
        { category: { contains: category, mode: "insensitive" } },
        { services: { some: { category: { contains: category, mode: "insensitive" } } } },
        { skills: { some: { category: { contains: category, mode: "insensitive" } } } },
      ],
    });
  }

  // ─── Keyword search with synonym expansion ───────────
  if (q) {
    const searchTerms = buildSearchTerms(q);

    // Build OR conditions across all searchable fields for every term
    const textOr: Prisma.ProfileWhereInput[] = searchTerms.flatMap((term) => [
      { displayName: { contains: term, mode: "insensitive" as const } },
      { bio: { contains: term, mode: "insensitive" as const } },
      { location: { contains: term, mode: "insensitive" as const } },
      { category: { contains: term, mode: "insensitive" as const } },
      { skills: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { skills: { some: { category: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { category: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { description: { contains: term, mode: "insensitive" as const } } } },
    ]);

    andConditions.push({ OR: textOr });
  }

  const where: Prisma.ProfileWhereInput = { AND: andConditions };

  // ─── Query ───────────────────────────────────────────
  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        skills: true,
        services: true,
        capabilities: { where: { isActive: true } },
        infoSections: { select: { section: true, subsection: true } },
      },
      skip: offset,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.profile.count({ where }),
  ]);

  // ─── Score & rank results by relevance ───────────────
  const queryLower = q.toLowerCase();
  const scored = profiles.map((p: typeof profiles[number]) => {
    let score = 0;
    const name = (p.displayName || "").toLowerCase();
    const bio = (p.bio || "").toLowerCase();

    // Exact name match = highest
    if (name === queryLower) score += 100;
    // Name contains full query
    else if (name.includes(queryLower)) score += 50;
    // Name contains any word
    const words = queryLower.split(/\s+/);
    for (const w of words) {
      if (name.includes(w)) score += 20;
      if (bio.includes(w)) score += 5;
      if ((p.category || "").toLowerCase().includes(w)) score += 15;
    }
    // Has more capabilities = more useful
    score += p.capabilities.length * 2;

    return { profile: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    results: scored.map(({ profile: p }) => ({
      id: p.id,
      type: p.type,
      name: p.displayName,
      bio: p.bio,
      location: p.location,
      status: p.status,
      category: p.category,
      capabilities: p.capabilities.map((c: typeof p.capabilities[number]) => c.type),
      skills: p.skills.map((s: typeof p.skills[number]) => s.name),
      services: p.services.map((s: typeof p.services[number]) => ({
        name: s.name,
        category: s.category,
        price: s.price,
      })),
      available_sections: [...new Set(p.infoSections.map((i: typeof p.infoSections[number]) => i.section))],
      profile_url: `/api/v1/profile/${p.id}`,
      info_url: `/api/v1/info/${p.id}`,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { agent: true, apiVersion: "v1" },
  });
}
