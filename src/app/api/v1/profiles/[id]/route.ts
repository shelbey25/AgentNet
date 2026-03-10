import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateApiKey,
  hasScope,
  unauthorized,
  forbidden,
  rateLimited,
} from "@/lib/api-auth";

// GET /api/v1/profiles/[id] — agent-readable profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateApiKey(request);

  if (!authResult) return unauthorized();
  if ("error" in authResult && authResult.error === "rate_limited")
    return rateLimited();
  if (
    !("scopes" in authResult) ||
    !hasScope(authResult.scopes, "read:profiles")
  )
    return forbidden("Missing scope: read:profiles");

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      skills: true,
      services: true,
    },
  });

  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    displayName: profile.displayName,
    type: profile.type,
    bio: profile.bio,
    location: profile.location,
    status: profile.status,
    skills: profile.skills.map((s) => ({
      name: s.name,
      category: s.category,
    })),
    services: profile.services.map((s) => ({
      name: s.name,
      description: s.description,
      category: s.category,
      price: s.price,
    })),
    ...(profile.type === "business" && {
      phone: profile.phone,
      website: profile.website,
      address: profile.address,
      hours: profile.hours,
    }),
    meta: { agent: true, apiVersion: "v1" },
  });
}
