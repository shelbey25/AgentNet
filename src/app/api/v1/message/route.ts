// POST /api/v1/message — Send a message to a user or business
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited, badRequest } from "@/lib/api-auth";
import { logAction } from "@/lib/adapters";
import { fireWebhook } from "@/lib/webhook";

export async function POST(request: NextRequest) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const start = Date.now();
  const body = await request.json();
  const { recipient_id, sender_id, message: messageBody, subject } = body;

  if (!recipient_id) return badRequest("recipient_id is required");
  if (!messageBody) return badRequest("message is required");

  // Look up recipient by profile ID or user ID
  let recipientUserId = recipient_id;
  const profile = await prisma.profile.findUnique({
    where: { id: recipient_id },
    select: { userId: true },
  });
  if (profile) {
    recipientUserId = profile.userId;
  }

  // Check recipient exists and accepts messages
  const recipient = await prisma.user.findUnique({
    where: { id: recipientUserId },
    include: { messageSettings: true },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  if (recipient.messageSettings && !recipient.messageSettings.allowMessages) {
    return NextResponse.json(
      { error: "Recipient does not accept messages" },
      { status: 403 }
    );
  }

  // Agent-sent messages are always drafts requiring human approval
  const isDraft = recipient.messageSettings?.allowAgentDraft !== false;

  const msg = await prisma.message.create({
    data: {
      senderId: sender_id || recipientUserId, // self-addressed if no sender
      recipientId: recipientUserId,
      subject: subject || "New message",
      body: messageBody,
      isDraft,
    },
  });

  // Fire webhook for the recipient's profile (if it exists)
  if (profile) {
    fireWebhook(recipient_id, "message", {
      message_id: msg.id,
      subject: msg.subject,
      body: msg.body,
      is_draft: isDraft,
      sender_id: msg.senderId,
    });
  }

  await logAction({
    action: "message",
    method: "POST",
    path: "/api/v1/message",
    payload: { recipient_id, subject },
    response: { message_id: msg.id, is_draft: isDraft },
    statusCode: 201,
    source: "agent",
    duration: Date.now() - start,
  });

  return NextResponse.json(
    {
      message_id: msg.id,
      is_draft: isDraft,
      status: isDraft ? "draft_pending_review" : "sent",
    },
    { status: 201 }
  );
}
