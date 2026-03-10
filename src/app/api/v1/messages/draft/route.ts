import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateApiKey,
  hasScope,
  unauthorized,
  forbidden,
  rateLimited,
  badRequest,
} from "@/lib/api-auth";

// POST /api/v1/messages/draft — agent can draft messages (requires human review to send)
export async function POST(request: NextRequest) {
  const authResult = await validateApiKey(request);

  if (!authResult) return unauthorized();
  if ("error" in authResult && authResult.error === "rate_limited")
    return rateLimited();
  if (
    !("scopes" in authResult) ||
    !hasScope(authResult.scopes, "write:messages.draft")
  )
    return forbidden("Missing scope: write:messages.draft");

  const { recipientId, subject, body } = await request.json();

  if (!recipientId || !subject || !body) {
    return badRequest("recipientId, subject, and body are required");
  }

  // Check recipient exists and allows agent drafts
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    include: { messageSettings: true },
  });

  if (!recipient) {
    return NextResponse.json(
      { error: "Recipient not found" },
      { status: 404 }
    );
  }

  if (
    recipient.messageSettings &&
    !recipient.messageSettings.allowAgentDraft
  ) {
    return NextResponse.json(
      { error: "Recipient does not accept agent-drafted messages" },
      { status: 403 }
    );
  }

  // Agent drafts are always saved as drafts — human must review and send
  const message = await prisma.message.create({
    data: {
      senderId: authResult.user.id, // API key owner is the sender
      recipientId,
      subject: `[Draft] ${subject}`,
      body,
      isDraft: true,
    },
  });

  return NextResponse.json(
    {
      id: message.id,
      status: "draft",
      message:
        "Message saved as draft. The account owner must review and send it.",
      meta: { agent: true, apiVersion: "v1" },
    },
    { status: 201 }
  );
}
