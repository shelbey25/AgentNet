import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/keys/[id] — revoke an API key
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const key = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!key) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: "API key revoked" });
}
