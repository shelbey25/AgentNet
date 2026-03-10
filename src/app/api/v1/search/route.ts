import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkPublicRateLimit,
  rateLimited,
} from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

// GET /api/v1/search — unified search for agents and frontend
// Supports text search across businesses, people, services, skills
export async function GET(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const capability = searchParams.get("capability");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const where: Prisma.ProfileWhereInput = { isPublic: true };

  if (type === "person" || type === "business") {
    where.type = type;
  }

  if (status) {
    const validStatuses = ["available", "looking_for_work", "hiring", "busy"];
    if (validStatuses.includes(status)) {
      where.status = status as Prisma.EnumProfileStatusFilter;
    }
  }

  if (capability) {
    where.capabilities = {
      some: { type: capability as never, isActive: true },
    };
  }

  if (q) {
    const searchTerms = q.toLowerCase().split(/\s+/).filter(Boolean);
    where.OR = searchTerms.flatMap((term) => [
      { displayName: { contains: term, mode: "insensitive" as const } },
      { bio: { contains: term, mode: "insensitive" as const } },
      { location: { contains: term, mode: "insensitive" as const } },
      { skills: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      { services: { some: { name: { contains: term, mode: "insensitive" as const } } } },
    ]);
  }

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

  return NextResponse.json({
    results: profiles.map((p) => ({
      id: p.id,
      type: p.type,
      name: p.displayName,
      bio: p.bio,
      location: p.location,
      status: p.status,
      capabilities: p.capabilities.map((c) => c.type),
      skills: p.skills.map((s) => s.name),
      services: p.services.map((s) => ({
        name: s.name,
        category: s.category,
        price: s.price,
      })),
      info_sections: [...new Set(p.infoSections.map((i) => i.section))],
      profile_url: `/api/v1/profile/${p.id}`,
      info_url: `/api/v1/info/${p.id}`,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { agent: true, apiVersion: "v1" },
  });
}
