import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateApiKey,
  hasScope,
  unauthorized,
  forbidden,
  rateLimited,
} from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

// GET /api/v1/search — agent search endpoint (requires API key with read:search)
export async function GET(request: NextRequest) {
  const authResult = await validateApiKey(request);

  if (!authResult) return unauthorized();
  if ("error" in authResult && authResult.error === "rate_limited")
    return rateLimited();
  if (!("scopes" in authResult) || !hasScope(authResult.scopes, "read:search"))
    return forbidden("Missing scope: read:search");

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
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
      include: { skills: true, services: true },
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
      skills: p.skills.map((s) => s.name),
      services: p.services.map((s) => ({
        name: s.name,
        category: s.category,
        price: s.price,
      })),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    meta: { agent: true, apiVersion: "v1" },
  });
}
