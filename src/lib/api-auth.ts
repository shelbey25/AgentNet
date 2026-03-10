import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

// Valid scopes for API keys
export const VALID_SCOPES = [
  "read:search",
  "read:profiles",
  "write:messages.draft",
] as const;

export type Scope = (typeof VALID_SCOPES)[number];

// Rate limiting store (in-memory for MVP, swap to Redis later)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Validate API key and return the associated user + scopes
export async function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer agn_")) return null;

  const rawKey = authHeader.slice(7); // Remove "Bearer "
  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey || !apiKey.isActive) return null;

  // Check rate limit
  if (!checkRateLimit(`api:${apiKey.id}`, apiKey.rateLimit)) {
    return { error: "rate_limited" as const };
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    user: apiKey.user,
    scopes: apiKey.scopes as Scope[],
    apiKeyId: apiKey.id,
  };
}

// Check if API key has required scope
export function hasScope(scopes: Scope[], required: Scope): boolean {
  return scopes.includes(required);
}

// Public rate limiting (by IP)
export function checkPublicRateLimit(request: NextRequest): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  return checkRateLimit(`public:${ip}`, 30); // 30 req/min for public
}

// Standard error responses
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Insufficient permissions") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function rateLimited() {
  return NextResponse.json(
    { error: "Rate limit exceeded. Try again in a minute." },
    { status: 429 }
  );
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
