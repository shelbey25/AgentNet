import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createHash, randomBytes } from "crypto";
import { VALID_SCOPES } from "@/lib/api-auth";

// GET /api/keys — list own API keys (safe: prefix only)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      rateLimit: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

// POST /api/keys — create a new API key
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, scopes } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Key name is required" },
      { status: 400 }
    );
  }

  // Validate scopes
  const validatedScopes = (scopes || ["read:search", "read:profiles"]).filter(
    (s: string) => VALID_SCOPES.includes(s as (typeof VALID_SCOPES)[number])
  );

  if (validatedScopes.length === 0) {
    return NextResponse.json(
      { error: "At least one valid scope is required" },
      { status: 400 }
    );
  }

  // Max 5 active keys per user
  const activeKeyCount = await prisma.apiKey.count({
    where: { userId: session.user.id, isActive: true },
  });
  if (activeKeyCount >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 active API keys. Revoke an existing key first." },
      { status: 400 }
    );
  }

  // Generate key: agn_ prefix + 32 random bytes as hex
  const rawKey = `agn_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name,
      keyHash,
      keyPrefix,
      scopes: validatedScopes,
    },
  });

  // Return the raw key ONCE — it cannot be retrieved again
  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // ⚠️ Only shown once
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimit,
      createdAt: apiKey.createdAt,
      warning: "Save this key now. It cannot be retrieved again.",
    },
    { status: 201 }
  );
}
