// GET /api/v1/message/:id — Get message details
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPublicRateLimit, rateLimited } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkPublicRateLimit(request)) return rateLimited();

  const { id } = await params;

  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({
    message_id: message.id,
    sender_id: message.senderId,
    recipient_id: message.recipientId,
    subject: message.subject,
    body: message.body,
    is_read: message.isRead,
    is_draft: message.isDraft,
    status: message.isDraft ? "draft_pending_review" : message.isRead ? "read" : "sent",
    created_at: message.createdAt,
  });
}
