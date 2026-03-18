import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/v1/portfolio — get current user's student portfolio
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolio = await prisma.studentPortfolio.findUnique({
    where: { userId: session.user.id },
  });

  if (!portfolio) {
    return NextResponse.json({ portfolio: null });
  }

  return NextResponse.json({ portfolio });
}
