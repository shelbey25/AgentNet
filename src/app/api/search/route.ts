import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";
import type { EntityType, Prisma } from "@prisma/client";

// ─── Synonym expansion for better keyword matching ─────
const SYNONYMS: Record<string, string[]> = {
  // Campus terms
  professor: ["prof", "faculty", "instructor", "teacher"],
  prof: ["professor", "faculty", "instructor"],
  advisor: ["advising", "academic advisor", "counselor"],
  tutor: ["tutoring", "math", "science", "writing", "education", "help"],
  tutoring: ["tutor", "math", "science", "writing", "education"],
  research: ["lab", "researcher", "study", "opportunity"],
  internship: ["intern", "experience", "job", "opportunity"],
  scholarship: ["financial aid", "funding", "grant", "award"],
  dining: ["food", "eat", "cafeteria", "meal", "dining hall"],
  cafeteria: ["dining", "food", "eat", "meal"],
  library: ["study", "books", "reserve", "gorgas"],
  rec: ["recreation", "gym", "fitness", "workout"],
  gym: ["rec", "recreation", "fitness"],
  cs: ["computer science", "computing", "programming"],
  "computer science": ["cs", "computing", "programming"],
  // Local business terms
  barber: ["barbershop", "haircut", "fade", "shave", "hair"],
  barbershop: ["barber", "haircut", "fade", "shave", "hair"],
  haircut: ["barber", "barbershop", "hair", "salon", "cuts"],
  salon: ["hair", "haircut", "braids", "stylist", "cosmetologist"],
  hair: ["barber", "barbershop", "salon", "haircut", "braids", "stylist"],
  food: ["restaurant", "chicken", "coffee", "menu", "dining"],
  restaurant: ["food", "menu", "dine", "takeout"],
  chicken: ["restaurant", "food", "wings", "tenders"],
  coffee: ["cafe", "latte", "espresso", "pastry"],
  auto: ["car", "repair", "mechanic", "oil", "brake"],
  car: ["auto", "repair", "mechanic"],
  mechanic: ["auto", "repair", "car"],
  clean: ["cleaning", "cleaner", "maid", "housekeeping"],
  cleaning: ["clean", "cleaner", "maid"],
  trainer: ["fitness", "personal training", "gym", "workout"],
  fitness: ["trainer", "gym", "personal training", "workout"],
  design: ["graphic", "logo", "flyer", "creative"],
  lawn: ["landscaping", "mowing", "yard"],
  landscaping: ["lawn", "mowing", "yard", "tree"],
  handyman: ["repair", "fence", "gutter", "fix"],
  braids: ["hair", "salon", "locs", "stylist"],
};

function buildSearchTerms(query: string): string[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return [];
  const words = raw.split(/\s+/).filter(Boolean);
  const terms = new Set<string>();
  terms.add(raw);
  if (words.length > 1) terms.add(words.join(""));
  for (const w of words) {
    terms.add(w);
    const lower = w.toLowerCase();
    if (SYNONYMS[lower]) for (const syn of SYNONYMS[lower]) terms.add(syn);
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (key.startsWith(lower) || lower.startsWith(key)) {
        terms.add(key);
        for (const syn of syns) terms.add(syn);
      }
    }
  }
  return [...terms];
}

// GET /api/search?q=...&type=person|business|site|opportunity&status=...&category=...&page=1&limit=20
export async function GET(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const andConditions: Prisma.ProfileWhereInput[] = [{ isPublic: true }];

  const VALID_TYPES: Set<string> = new Set(["person", "business", "site", "opportunity"]);
  if (type && VALID_TYPES.has(type)) {
    andConditions.push({ type: type as EntityType });
  }

  if (status) {
    const validStatuses = ["available", "looking_for_work", "hiring", "busy"];
    if (validStatuses.includes(status)) {
      andConditions.push({ status: status as Prisma.EnumProfileStatusFilter });
    }
  }

  if (q) {
    const searchTerms = buildSearchTerms(q);
    const textOr: Prisma.ProfileWhereInput[] = searchTerms.flatMap((term) => [
      { displayName: { contains: term, mode: "insensitive" as const } },
      { bio: { contains: term, mode: "insensitive" as const } },
      { location: { contains: term, mode: "insensitive" as const } },
      { category: { contains: term, mode: "insensitive" as const } },
      { department: { contains: term, mode: "insensitive" as const } },
      { title: { contains: term, mode: "insensitive" as const } },
      { tags: { has: term } },
      { skills: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { skills: { some: { category: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { category: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { description: { contains: term, mode: "insensitive" as const } } } },
    ]);
    andConditions.push({ OR: textOr });
  }

  if (category) {
    andConditions.push({
      OR: [
        { category: { contains: category, mode: "insensitive" } },
        { skills: { some: { category: { contains: category, mode: "insensitive" } } } },
        { services: { some: { category: { contains: category, mode: "insensitive" } } } },
      ],
    });
  }

  const where: Prisma.ProfileWhereInput = { AND: andConditions };

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        skills: true,
        services: true,
        user: { select: { name: true } },
      },
      skip: offset,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.profile.count({ where }),
  ]);

  // Score & rank by relevance
  const queryLower = q.toLowerCase();
  const scored = profiles.map((p: typeof profiles[number]) => {
    let score = 0;
    const name = (p.displayName || "").toLowerCase();
    const bio = (p.bio || "").toLowerCase();
    if (name === queryLower) score += 100;
    else if (name.includes(queryLower)) score += 50;
    for (const w of queryLower.split(/\s+/)) {
      if (name.includes(w)) score += 20;
      if (bio.includes(w)) score += 5;
    }
    return { profile: p, score };
  });
  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    results: scored.map(({ profile: p }) => ({
      id: p.id,
      displayName: p.displayName,
      type: p.type,
      bio: p.bio,
      location: p.location,
      status: p.status,
      avatarUrl: p.avatarUrl,
      ...(p.campusRole && { campus_role: p.campusRole }),
      ...(p.department && { department: p.department }),
      ...(p.title && { title: p.title }),
      ...(p.tags && p.tags.length > 0 && { tags: p.tags }),
      skills: p.skills.map((s: typeof p.skills[number]) => ({ name: s.name, category: s.category })),
      services: p.services.map((s: typeof p.services[number]) => ({
        name: s.name,
        category: s.category,
        price: s.price,
      })),
      ...(["business", "site"].includes(p.type) && {
        phone: p.phone,
        website: p.website,
        address: p.address,
        hours: p.hours,
      }),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
