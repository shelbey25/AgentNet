// GET /api/v1/my-entities — list all entities owned by the authenticated user
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    include: {
      capabilities: true,
      services: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    entities: profiles.map((p) => ({
      id: p.id,
      type: p.type,
      displayName: p.displayName,
      status: p.status,
      category: p.category,
      webhookEnabled: p.webhookEnabled,
      webhookUrl: p.webhookUrl ? "***configured***" : null,
      enabledWebhookEvents: p.enabledWebhookEvents,
      capabilities: p.capabilities.map((c) => ({
        type: c.type,
        isActive: c.isActive,
      })),
      services: p.services,
      createdAt: p.createdAt,
    })),
    count: profiles.length,
  });
}
