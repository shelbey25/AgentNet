import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages/[id] — read single message
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const message = await prisma.message.findFirst({
    where: {
      id,
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Auto-mark as read if recipient is viewing
  if (message.recipientId === session.user.id && !message.isRead) {
    await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return NextResponse.json(message);
}
