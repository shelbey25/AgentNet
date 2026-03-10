// POST /api/v1/entity — create a new entity under the authenticated user
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { EntityType } from "@prisma/client";

const VALID_ENTITY_TYPES: EntityType[] = [
  "person",
  "business",
  "site",
  "opportunity",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, displayName, bio, category, location } = body;

  if (!type || !VALID_ENTITY_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_ENTITY_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!displayName) {
    return NextResponse.json(
      { error: "displayName is required" },
      { status: 400 }
    );
  }

  const profile = await prisma.profile.create({
    data: {
      userId: session.user.id,
      type,
      displayName,
      bio: bio || null,
      category: category || null,
      location: location || "Tuscaloosa, AL",
    },
    include: {
      capabilities: true,
      services: true,
    },
  });

  return NextResponse.json(
    {
      id: profile.id,
      type: profile.type,
      displayName: profile.displayName,
      message: "Entity created. Configure webhook settings via PATCH /api/v1/entity/:id/settings",
    },
    { status: 201 }
  );
}
