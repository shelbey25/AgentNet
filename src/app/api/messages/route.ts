import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages — inbox (received messages)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { recipientId: session.user.id },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(messages);
}

// POST /api/messages — send a message
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientId, subject, body, isDraft } = await request.json();

  if (!recipientId || !subject || !body) {
    return NextResponse.json(
      { error: "recipientId, subject, and body are required" },
      { status: 400 }
    );
  }

  // Can't message yourself
  if (recipientId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot message yourself" },
      { status: 400 }
    );
  }

  // Check recipient exists
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

  // Check if recipient allows messages
  if (recipient.messageSettings && !recipient.messageSettings.allowMessages) {
    return NextResponse.json(
      { error: "This user is not accepting messages" },
      { status: 403 }
    );
  }

  // Rate limit: max 20 messages per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.message.count({
    where: {
      senderId: session.user.id,
      createdAt: { gte: oneHourAgo },
    },
  });
  if (recentCount >= 20) {
    return NextResponse.json(
      { error: "Message rate limit reached (20/hour). Try again later." },
      { status: 429 }
    );
  }

  // Rate limit first-contact: max 5 new contacts per day
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingConvo = await prisma.message.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, recipientId },
        { senderId: recipientId, recipientId: session.user.id },
      ],
      createdAt: { lt: oneDayAgo },
    },
  });

  if (!existingConvo) {
    const newContactsToday = await prisma.message.groupBy({
      by: ["recipientId"],
      where: {
        senderId: session.user.id,
        createdAt: { gte: oneDayAgo },
      },
    });
    if (newContactsToday.length >= 5) {
      return NextResponse.json(
        {
          error:
            "First-contact limit reached (5/day). You can continue existing conversations.",
        },
        { status: 429 }
      );
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId,
      subject,
      body,
      isDraft: isDraft || false,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
