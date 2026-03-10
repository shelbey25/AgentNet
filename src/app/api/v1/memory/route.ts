// GET/POST /api/v1/memory — User memory (personalization) CRUD
// Stores user preferences like major, year, interests, dining preferences

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/v1/memory — List all memory entries for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memories = await prisma.userMemory.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    memories: memories.map((m) => ({
      key: m.key,
      value: m.value,
      source: m.source,
      updated_at: m.updatedAt.toISOString(),
    })),
  });
}

// POST /api/v1/memory — Set a memory entry (upsert)
// Body: { key: string, value: string, source?: string }
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { key, value, source } = body;

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  if (!value || typeof value !== "string") {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }

  // Validate key format (alphanumeric + underscores, max 50 chars)
  const validKey = /^[a-z0-9_]{1,50}$/;
  if (!validKey.test(key)) {
    return NextResponse.json(
      { error: "key must be lowercase alphanumeric with underscores, max 50 chars" },
      { status: 400 }
    );
  }

  const memory = await prisma.userMemory.upsert({
    where: {
      userId_key: { userId: session.user.id, key },
    },
    update: {
      value,
      source: source || "user_stated",
    },
    create: {
      userId: session.user.id,
      key,
      value,
      source: source || "user_stated",
    },
  });

  return NextResponse.json(
    {
      key: memory.key,
      value: memory.value,
      source: memory.source,
      updated_at: memory.updatedAt.toISOString(),
    },
    { status: 200 }
  );
}
