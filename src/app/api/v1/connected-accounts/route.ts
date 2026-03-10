// GET/POST /api/v1/connected-accounts — Connected account scaffolding
// Supports: outlook, gmail, canvas, myBama

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const VALID_PROVIDERS = ["outlook", "gmail", "canvas", "mybama"];

// GET — List connected accounts for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.connectedAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      provider: a.provider,
      is_active: a.isActive,
      external_id: a.externalId,
      scope: a.scope,
      connected_at: a.connectedAt?.toISOString(),
    })),
  });
}

// POST — Initiate or register a connected account
// Body: { provider: string }
// In MVP, this creates a placeholder entry. OAuth flow will be added later.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { provider } = body;

  if (!provider || !VALID_PROVIDERS.includes(provider.toLowerCase())) {
    return NextResponse.json(
      { error: `Invalid provider. Supported: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400 }
    );
  }

  const account = await prisma.connectedAccount.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: provider.toLowerCase(),
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      provider: provider.toLowerCase(),
      isActive: false, // Not active until OAuth completes
    },
  });

  return NextResponse.json(
    {
      id: account.id,
      provider: account.provider,
      is_active: account.isActive,
      message: `Connected account registered for ${provider}. OAuth integration coming soon.`,
      // Future: return oauth_url here for the redirect flow
      // oauth_url: `https://login.microsoftonline.com/...` for outlook
    },
    { status: 201 }
  );
}
