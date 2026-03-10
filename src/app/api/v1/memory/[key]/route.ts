// DELETE /api/v1/memory/[key] — Remove a specific memory entry

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  const existing = await prisma.userMemory.findUnique({
    where: { userId_key: { userId: session.user.id, key } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Memory key not found" }, { status: 404 });
  }

  await prisma.userMemory.delete({
    where: { userId_key: { userId: session.user.id, key } },
  });

  return NextResponse.json({ deleted: key });
}
