// POST /api/v1/entities/skill — add a skill to a profile

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkServiceKey(request: NextRequest) {
  const key = process.env.ENTITIES_API_KEY;
  if (!key) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function POST(request: NextRequest) {
  if (!checkServiceKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profileId, name, level, category } = body;

  if (!profileId || !name) {
    return NextResponse.json({ error: "profileId and name are required" }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: {
      profileId,
      name,
      category: category || level || null,
    },
  });

  return NextResponse.json({ id: skill.id }, { status: 201 });
}
