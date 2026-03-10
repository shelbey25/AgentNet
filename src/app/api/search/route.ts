import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

// GET /api/search?q=...&type=person|business&status=...&category=...&page=1&limit=20
export async function GET(request: NextRequest) {
  // Rate limit public access
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  // Build filter conditions
  const where: Prisma.ProfileWhereInput = {
    isPublic: true,
  };

  if (type === "person" || type === "business") {
    where.type = type;
  }

  if (status) {
    const validStatuses = ["available", "looking_for_work", "hiring", "busy"];
    if (validStatuses.includes(status)) {
      where.status = status as Prisma.EnumProfileStatusFilter;
    }
  }

  // Text search: search across displayName, bio, skills, and services
  if (q) {
    const searchTerms = q.toLowerCase().split(/\s+/).filter(Boolean);
    where.OR = searchTerms.flatMap((term) => [
      { displayName: { contains: term, mode: "insensitive" as const } },
      { bio: { contains: term, mode: "insensitive" as const } },
      { location: { contains: term, mode: "insensitive" as const } },
      { skills: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { skills: { some: { category: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { category: { contains: term, mode: "insensitive" as const } } } },
    ]);
  }

  if (category) {
    // Filter by skill or service category
    where.AND = [
      {
        OR: [
          { skills: { some: { category: { contains: category, mode: "insensitive" } } } },
          { services: { some: { category: { contains: category, mode: "insensitive" } } } },
        ],
      },
    ];
  }

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

  return NextResponse.json({
    results: profiles.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      type: p.type,
      bio: p.bio,
      location: p.location,
      status: p.status,
      avatarUrl: p.avatarUrl,
      skills: p.skills.map((s) => ({ name: s.name, category: s.category })),
      services: p.services.map((s) => ({
        name: s.name,
        category: s.category,
        price: s.price,
      })),
      // Business fields
      ...(p.type === "business" && {
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
