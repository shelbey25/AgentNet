// GET  /api/v1/entity/[id]/settings — get entity settings (owner only)
// PATCH /api/v1/entity/[id]/settings — update webhook & general settings
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_WEBHOOK_EVENTS = [
  "ordering",
  "booking",
  "messaging",
  "service_requests",
  "quotes",
  "availability",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      capabilities: true,
      businessEndpoints: { select: { action: true, isActive: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  // Only the owner can view settings
  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: profile.id,
    type: profile.type,
    displayName: profile.displayName,
    status: profile.status,
    webhook: {
      enabled: profile.webhookEnabled,
      url: profile.webhookUrl || null,
      secret: profile.webhookSecret ? "***configured***" : null,
      enabledEvents: profile.enabledWebhookEvents,
      availableEvents: VALID_WEBHOOK_EVENTS,
    },
    capabilities: profile.capabilities.map((c) => ({
      type: c.type,
      isActive: c.isActive,
    })),
    endpoints: profile.businessEndpoints,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  if (profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    webhookUrl,
    webhookSecret,
    webhookEnabled,
    enabledWebhookEvents,
    displayName,
    status,
  } = body;

  // Validate webhook events if provided
  if (enabledWebhookEvents) {
    if (!Array.isArray(enabledWebhookEvents)) {
      return NextResponse.json(
        { error: "enabledWebhookEvents must be an array" },
        { status: 400 }
      );
    }
    const invalid = enabledWebhookEvents.filter(
      (e: string) => !VALID_WEBHOOK_EVENTS.includes(e)
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid webhook events: ${invalid.join(", ")}`,
          validEvents: VALID_WEBHOOK_EVENTS,
        },
        { status: 400 }
      );
    }
  }

  // Validate webhook URL if provided
  if (webhookUrl !== undefined && webhookUrl !== null && webhookUrl !== "") {
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      ...(webhookUrl !== undefined && { webhookUrl: webhookUrl || null }),
      ...(webhookSecret !== undefined && {
        webhookSecret: webhookSecret || null,
      }),
      ...(webhookEnabled !== undefined && { webhookEnabled }),
      ...(enabledWebhookEvents !== undefined && { enabledWebhookEvents }),
      ...(displayName !== undefined && { displayName }),
      ...(status !== undefined && { status }),
    },
    select: {
      id: true,
      displayName: true,
      webhookEnabled: true,
      webhookUrl: true,
      enabledWebhookEvents: true,
    },
  });

  return NextResponse.json({
    ...updated,
    webhookUrl: updated.webhookUrl ? "***configured***" : null,
    message: "Settings updated",
  });
}
