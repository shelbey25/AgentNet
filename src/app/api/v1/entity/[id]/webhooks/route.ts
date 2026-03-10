// GET /api/v1/entity/[id]/webhooks — view recent webhook logs for an entity
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { userId: true, displayName: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const event = searchParams.get("event");

  const logs = await prisma.webhookLog.findMany({
    where: {
      profileId: id,
      ...(event && { event }),
    },
    orderBy: { deliveredAt: "desc" },
    take: limit,
    select: {
      id: true,
      event: true,
      url: true,
      statusCode: true,
      success: true,
      attempts: true,
      error: true,
      deliveredAt: true,
    },
  });

  return NextResponse.json({
    entity: profile.displayName,
    logs,
    count: logs.length,
  });
}
